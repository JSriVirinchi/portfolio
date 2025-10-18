import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useGithubSearch } from '../hooks/useGithubSearch';
import { SectionHeader } from './SectionHeader';

export function GithubShowcase() {
  const { query, setQuery, results, loading, error } = useGithubSearch('');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [page, setPage] = useState(0);

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

  const padCount = Math.max(0, pageSize - pageResults.length);
  const placeholders = useMemo(
    () => (padCount > 0 ? Array.from({ length: padCount }, (_, index) => index) : []),
    [padCount],
  );

  const goToPrev = () => setPage((current) => Math.max(0, current - 1));
  const goToNext = () => setPage((current) => Math.min(totalPages - 1, current + 1));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = (formData.get('query') || '') as string;
    setQuery(value);
  };

  return (
    <section className="section" id="github">
      <SectionHeader
        eyebrow="Open Source"
        title="GitHub explorations"
        description="Browse recent projects and prototypes. Filter with keywords to find a match."
      />
      <form className="github-search" onSubmit={onSubmit}>
        <input
          type="search"
          name="query"
          placeholder="Search repositories, tech, or topics"
          defaultValue={query}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p className="github-status">Loading repositories...</p>}
      {error && <p className="github-status error">{error}</p>}
      {!loading && !error && (
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
