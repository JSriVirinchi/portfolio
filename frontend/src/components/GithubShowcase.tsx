import { type FormEvent } from 'react';
import { useGithubSearch } from '../hooks/useGithubSearch';
import { SectionHeader } from './SectionHeader';

export function GithubShowcase() {
  const { query, setQuery, results, loading, error } = useGithubSearch('');

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
          {results.map((repo) => (
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
        </div>
      )}
    </section>
  );
}
