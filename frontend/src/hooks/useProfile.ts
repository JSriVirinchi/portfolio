import { useEffect, useState } from 'react';
import { getProfile } from '../api/client';
import type { Profile } from '../types';

interface State {
  data?: Profile;
  loading: boolean;
  error?: string;
}

export function useProfile() {
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        setState({ data, loading: false });
      })
      .catch((error: Error) => {
        if (!active) return;
        setState({ loading: false, error: error.message });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
