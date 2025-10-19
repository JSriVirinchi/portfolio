import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useGithubSearch } from '../hooks/useGithubSearch';
import type { Profile } from '../types';
import { SectionHeader } from './SectionHeader';
import { GithubHeatmap } from './GithubHeatmap';

interface Props {
  profile: Profile;
}

function deriveDefaultQuery(profile: Profile) {
  if (!profile.github) return '';
  const handle = profile.github.trim();
  if (!handle) return '';
  if (!handle.includes('http')) {
    return handle.startsWith('@') ? handle.slice(1) : handle;
  }

  try {
    const url = new URL(handle);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.pop() ?? '';
  } catch {
    return handle;
  }
}

export function GithubShowcase({ profile }: Props) {
  const defaultQuery = useMemo(() => deriveDefaultQuery(profile), [profile]);
  const { setQuery, results, loading, error } = useGithubSearch('');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const username = defaultQuery;
  const displayHandle = username ? `@${username}` : profile.name.split(' ')[0] || profile.name;
  const githubProfileUrl = useMemo(() => {
    if (!profile.github) {
      return username ? `https://github.com/${username}` : undefined;
    }
    if (profile.github.startsWith('http')) return profile.github;
    const handle = profile.github.startsWith('@') ? profile.github.slice(1) : profile.github;
    return `https://github.com/${handle}`;
  }, [profile.github, username]);

  const suggestionKeywords = useMemo(() => {
    const languages = profile.skills?.languages ?? [];
    const values = languages
      .map((item) => (typeof item === 'string' ? item : item.name))
      .filter((value): value is string => Boolean(value));
    return values.slice(0, 3);
  }, [profile.skills]);

  const keywordPhrase = useMemo(() => {
    if (suggestionKeywords.length === 0) return '';
    if (suggestionKeywords.length === 1) return suggestionKeywords[0];
    const [lastKeyword] = suggestionKeywords.slice(-1);
    const leading = suggestionKeywords.slice(0, -1).join(', ');
    return `${leading} or ${lastKeyword}`;
  }, [suggestionKeywords]);

  useEffect(() => {
    setSearchValue('');
    setLastSubmittedQuery('');
    setQuery('');
  }, [setQuery]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = useMemo(() => {
    if (viewportWidth >= 1024) return 3;
    if (viewportWidth >= 720) return 2;
    return 1;
  }, [viewportWidth]);

  const pageSize = Math.max(1, columns * 2);
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize) || 1);

  useEffect(() => {
    setPage(0);
  }, [results, pageSize]);

  const pageResults = useMemo(() => {
    const start = page * pageSize;
    return results.slice(start, start + pageSize);
  }, [page, pageSize, results]);

  const padCount = results.length === 0 ? 0 : Math.max(0, pageSize - pageResults.length);
  const placeholders = useMemo(
    () => (padCount > 0 ? Array.from({ length: padCount }, (_, index) => index) : []),
    [padCount],
  );
  const trimmedSubmittedQuery = lastSubmittedQuery.trim();

  const goToPrev = () => setPage((current) => Math.max(0, current - 1));
  const goToNext = () => setPage((current) => Math.min(totalPages - 1, current + 1));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = searchValue.trim();
    setLastSubmittedQuery(value);
    setQuery(value);
  };

  useEffect(() => {
    if (searchValue.trim() === '' && trimmedSubmittedQuery !== '') {
      setLastSubmittedQuery('');
      setQuery('');
    }
  }, [searchValue, trimmedSubmittedQuery, setQuery]);

  return (
    <section className="section" id="github">
      <SectionHeader
        eyebrow="Open Source"
        title="GitHub explorations"
        description="Browse recent projects and prototypes. Filter with keywords to find a match."
      />
      <GithubHeatmap profile={profile} />
      <form className="github-search" onSubmit={onSubmit}>
        <input
          type="search"
          name="query"
          placeholder="Search repositories, tech, or topics"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p className="github-status">Loading repositories...</p>}
      {error && <p className="github-status error">{error}</p>}
      {!loading && !error && results.length === 0 && trimmedSubmittedQuery !== '' && (
        <div className="github-empty">
          <div className="github-empty-card accent">
            <h3>{trimmedSubmittedQuery ? `No results for "${trimmedSubmittedQuery}"` : 'No repositories matched'}</h3>
            <p>
              {trimmedSubmittedQuery
                ? `Nothing matched your search for "${trimmedSubmittedQuery}".`
                : 'Nothing matched the current filters.'}{' '}
              {githubProfileUrl ? (
                <>
                  Jump over to{' '}
                  <a href={githubProfileUrl} target="_blank" rel="noreferrer">
                    {displayHandle}&rsquo;s GitHub profile
                  </a>{' '}
                  to browse every project.
                </>
              ) : (
                'Browse the GitHub profile directly to explore every project.'
              )}
            </p>
          </div>
          <div className="github-empty-card">
            <h4>Search tips</h4>
            <ul>
              {keywordPhrase ? (
                <li>Start with keywords like {keywordPhrase}.</li>
              ) : (
                <li>Try keywords for stacks you know I use (React, TypeScript, FastAPI, etc.).</li>
              )}
              <li>Think in themes: "portfolio", "api", or "dashboard" to highlight specific project types.</li>
              {githubProfileUrl && (
                <li>
                  Jump straight to my{' '}
                  <a href={`${githubProfileUrl}?tab=repositories`} target="_blank" rel="noreferrer">
                    repositories tab
                  </a>{' '}
                  for hand-picked projects.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      {!loading && !error && results.length > 0 && (
        <div className="github-grid">
          {pageResults.map((repo) => (
            <article key={repo.html_url} className="github-card">
              <header>
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  <h3>{repo.name}</h3>
                </a>
                {repo.language && <span className="github-language">{repo.language}</span>}
              </header>
              {repo.description && <p className="github-description">{repo.description}</p>}
              <footer>
                <span>Stars: {repo.stargazers_count}</span>
                {repo.homepage && (
                  <a href={repo.homepage} target="_blank" rel="noreferrer">
                    Live
                  </a>
                )}
              </footer>
              {repo.topics.length > 0 && (
                <div className="github-topics">
                  {repo.topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
          {placeholders.map((value) => (
            <article key={`placeholder-${page}-${value}`} className="github-card placeholder" aria-hidden="true" />
          ))}
        </div>
      )}
      {!loading && !error && results.length > pageSize && (
        <div className="github-pagination">
          <button type="button" onClick={goToPrev} disabled={page === 0}>
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button type="button" onClick={goToNext} disabled={page + 1 >= totalPages}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}
