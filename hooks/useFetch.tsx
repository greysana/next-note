import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions extends RequestInit {
  skip?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFetch<T = any>(
  url: string,
  options?: UseFetchOptions
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const { skip, ...fetchOptions } = options || {};

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, fetchOptions]
  );

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [skip, fetchData, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { data, loading, error, refetch };
}

// -------------USAGE----------------------

// // Basic GET request
// const { data, loading, error } = useFetch<User[]>('https://api.example.com/users');

// // With custom options
// const { data, loading, error } = useFetch<Post>('https://api.example.com/posts', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ title: 'New Post' })
// });

// // Conditional fetching
// const { data } = useFetch<User>(`/api/users/${userId}`, { skip: !userId });

// // Manual refetch
// const { data, refetch } = useFetch<Data>('/api/data');
// <button onClick={refetch}>Refresh</button>
