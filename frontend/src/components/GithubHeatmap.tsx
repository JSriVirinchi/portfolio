import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import ActivityCalendar, { type Activity, type ThemeInput } from 'react-activity-calendar';
import type { Profile } from '../types';

interface Props {
  profile: Profile;
}

interface ContributionResponse {
  contributions: Activity[];
  total: Record<string, number>;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'missing';

const calendarTheme: ThemeInput = {
  light: ['#0f172a', '#124a2c', '#176736', '#1f8946', '#34d363'],
  dark: ['#0f172a', '#124a2c', '#176736', '#1f8946', '#34d363'],
};

function parseGithubUsername(handle?: string): string | undefined {
  if (!handle) return undefined;
  const value = handle.trim();
  if (!value) return undefined;
  if (!value.includes('http')) {
    return value.startsWith('@') ? value.slice(1) : value;
  }

  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.pop();
  } catch {
    return value;
  }
}

function formatDateLabel(input: string | undefined) {
  if (!input) return undefined;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function formatFullDateLabel(input: string | undefined) {
  if (!input) return undefined;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function filterContributionsByYear(data: Activity[], year?: number) {
  if (!year) return data;
  return data.filter((item) => {
    const itemYear = new Date(item.date).getFullYear();
    return !Number.isNaN(itemYear) && itemYear === year;
  });
}

export function GithubHeatmap({ profile }: Props) {
  const username = useMemo(() => parseGithubUsername(profile.github), [profile.github]);
  const [state, setState] = useState<{
    status: LoadState;
    data: Activity[];
    totals: Record<string, number>;
    error?: string;
  }>({
    status: username ? 'loading' : 'missing',
    data: [],
    totals: {},
  });
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [yearCache, setYearCache] = useState<Record<number, Activity[]>>({});
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!username) {
      setState({ status: 'missing', data: [], totals: {} });
      setSelectedYear(undefined);
      setYearOptions([]);
      setYearCache({});
      return;
    }

    let active = true;
    setState((previous) => ({ ...previous, status: 'loading', error: undefined }));
    setYearOptions([]);
    setYearCache({});
    setSelectedYear(undefined);

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub contributions request failed (${response.status})`);
        }
        return response.json() as Promise<ContributionResponse>;
      })
      .then((payload) => {
        if (!active) return;

        const contributions = payload.contributions ?? [];
        const totalsRecord = payload.total ?? {};
        const totalsYears = Object.keys(totalsRecord)
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value))
          .sort((a, b) => b - a);
        const contributionYears = totalsYears.length > 0
          ? totalsYears
          : Array.from(
              new Set(
                contributions
                  .map((item) => new Date(item.date).getFullYear())
                  .filter((value) => !Number.isNaN(value)),
              ),
            ).sort((a, b) => b - a);
        const fallbackYears = contributionYears.length > 0 ? contributionYears : [new Date().getFullYear()];
        const trimmedYears = fallbackYears.slice(0, 6);
        const defaultYear = trimmedYears[0];
        const defaultData = filterContributionsByYear(contributions, defaultYear);

        setYearOptions(trimmedYears);
        setYearCache((prev) => ({ ...prev, [defaultYear]: defaultData }));
        setSelectedYear(defaultYear);
        setState({
          status: 'ready',
          data: defaultData,
          totals: totalsRecord,
        });
      })
      .catch((error: Error) => {
        if (!active) return;
        setState({
          status: 'error',
          data: [],
          totals: {},
          error: error.message || 'Unable to load contributions.',
        });
      });

    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (!username) return;
    if (selectedYear === undefined) return;

    const cached = yearCache[selectedYear];
    if (cached) {
      setState((previous) => ({
        status: 'ready',
        data: cached,
        totals: previous.totals,
        error: undefined,
      }));
      return;
    }

    let active = true;
    setState((previous) => ({ ...previous, status: 'loading', error: undefined }));

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${selectedYear}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub contributions request failed (${response.status})`);
        }
        return response.json() as Promise<ContributionResponse>;
      })
      .then((payload) => {
        if (!active) return;
        const contributions = filterContributionsByYear(payload.contributions ?? [], selectedYear);
        setYearCache((previous) => ({ ...previous, [selectedYear]: contributions }));
        setState((previous) => ({
          status: 'ready',
          data: contributions,
          totals: previous.totals,
          error: undefined,
        }));
      })
      .catch((error: Error) => {
        if (!active) return;
        setState((previous) => ({
          status: 'error',
          data: [],
          totals: previous.totals,
          error: error.message || 'Unable to load contributions.',
        }));
      });

    return () => {
      active = false;
    };
  }, [selectedYear, username, yearCache]);

  const totalContributions = useMemo(
    () => state.data.reduce((sum, item) => sum + item.count, 0),
    [state.data],
  );

  useEffect(() => {
    if (selectedYear !== undefined) return;
    if (yearOptions.length === 0) return;
    setSelectedYear(yearOptions[0]);
  }, [selectedYear, yearOptions]);

  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(false);
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  useEffect(() => {
    setOpenDropdown(false);
  }, [selectedYear]);

  const firstDate = state.data[0]?.date;
  const lastDate = state.data[state.data.length - 1]?.date;
  const formattedRange = useMemo(() => {
    const start = formatDateLabel(firstDate);
    const end = formatDateLabel(lastDate);
    if (!start || !end) return undefined;
    return `${start} - ${end}`;
  }, [firstDate, lastDate]);

  if (state.status === 'missing') {
    return null;
  }

  return (
    <div className="github-contributions" aria-live="polite">
      <div className="github-heatmap-header">
        <div>
          <p className="github-heatmap-title">
            Virinchi&rsquo;s contribution streak
          </p>
          {formattedRange && (
            <p className="github-heatmap-range">{formattedRange}</p>
          )}
        </div>
        <div className="github-heatmap-meta">
          <span className="github-heatmap-username">@{username}</span>
          <span className="github-heatmap-total">
            {totalContributions.toLocaleString()} contributions
          </span>
          {yearOptions.length > 0 && selectedYear !== undefined && (
            <div
              ref={dropdownRef}
              className="github-heatmap-dropdown"
              data-state={openDropdown ? 'open' : 'closed'}
            >
              <button
                type="button"
                className="github-heatmap-dropdown-trigger"
                onClick={() => setOpenDropdown((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={openDropdown}
              >
                <span className="github-heatmap-dropdown-label">Year</span>
                <span className="github-heatmap-dropdown-value">{selectedYear}</span>
                <span className="github-heatmap-dropdown-caret" aria-hidden>
                  ▾
                </span>
              </button>
              {openDropdown && (
                <ul className="github-heatmap-dropdown-menu" role="listbox" aria-label="Select contribution year">
                  {yearOptions.map((year) => (
                    <li key={year}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={year === selectedYear}
                        onClick={() => {
                          setSelectedYear(year);
                          setOpenDropdown(false);
                        }}
                      >
                        <span>{year}</span>
                        {year === selectedYear && <span className="github-heatmap-dropdown-check" aria-hidden>✓</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {state.status === 'loading' && (
        <p className="github-heatmap-status">Fetching contribution activity…</p>
      )}
      {state.status === 'error' && (
        <p className="github-heatmap-status error">
          Couldn&apos;t load the contribution heatmap. {state.error}
        </p>
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <div className="github-heatmap-content">
          <div className="github-heatmap-calendar-wrapper">
            <div className="github-heatmap-calendar">
              <ActivityCalendar
                data={state.data}
                labels={{
                  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  totalCount: '{{count}} contributions in the selected year',
                  legend: { less: 'Less', more: 'More' },
                }}
                theme={calendarTheme}
                weekStart={1}
                showWeekdayLabels
                blockRadius={4}
                blockSize={12}
                blockMargin={4}
                renderBlock={(block, activity) =>
                  cloneElement(block, {
                    title:
                      activity.count === 0
                        ? `${formatFullDateLabel(activity.date)}: No contributions`
                        : `${formatFullDateLabel(activity.date)}: ${activity.count} ${
                            activity.count === 1 ? 'contribution' : 'contributions'
                          }`,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
      {state.status === 'ready' && state.data.length === 0 && (
        <p className="github-heatmap-status">No public contributions reported for this period.</p>
      )}
    </div>
  );
}
