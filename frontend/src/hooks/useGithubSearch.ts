import { useEffect, useState } from 'react';
import { searchRepos } from '../api/client';
import type { GithubRepo } from '../types';

interface GithubState {
  loading: boolean;
  error?: string;
  results: GithubRepo[];
}

export function useGithubSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState<GithubState>({ loading: true, results: [] });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    const handle = setTimeout(() => {
      searchRepos(query)
        .then((response) => {
          if (!active) return;
          setState({ loading: false, results: response.results });
        })
        .catch((error: Error) => {
          if (!active) return;
          setState({ loading: false, results: [], error: error.message });
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query]);

  return {
    ...state,
    query,
    setQuery,
  };
}
