import { useCallback, useEffect, useState } from "react";

type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type UseFetchResult<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
};

/**
 * Client-side data fetching hook with loading, error, and refetch support.
 *
 * @param url  The URL to fetch (pass null/undefined to skip fetching)
 *
 * @example
 * const { data, loading, error, refetch } = useFetch<Task[]>("/api/tasks");
 */
export function useFetch<T>(url: string | null | undefined): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });

  const fetchData = useCallback(async () => {
    if (!url) return;

    setState({ status: "loading" });

    try {
      const res = await fetch(url);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }

      const data: T = await res.json();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: state.status === "success" ? state.data : undefined,
    loading: state.status === "loading" || state.status === "idle",
    error: state.status === "error" ? state.error : undefined,
    refetch: fetchData,
  };
}
