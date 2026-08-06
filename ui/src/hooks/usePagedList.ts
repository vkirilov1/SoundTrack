import { useEffect, useRef, useState } from "react";
import type { PagedResponse } from "../types/api";

interface UsePagedListOptions {
  /** Set to false to skip fetching (e.g. while an id prop is still invalid). */
  enabled?: boolean;
}

/**
 * Fetches page 0 of a paginated resource on mount (or whenever `fetchPage`
 * changes — pass a `useCallback`'d fetcher so it only changes when its own
 * inputs, like a userId, do), and exposes `goToPage` to load further pages.
 */
export function usePagedList<T>(
  fetchPage: (page: number) => Promise<PagedResponse<T>>,
  { enabled = true }: UsePagedListOptions = {},
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rawLoading, setRawLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    if (hasLoadedOnce.current) {
      setListLoading(true);
    }

    fetchPage(0)
      .then((res) => {
        if (cancelled) return;
        setItems(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        hasLoadedOnce.current = true;
        setRawLoading(false);
        setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage, enabled]);

  const loading = enabled && rawLoading;

  function goToPage(nextPage: number) {
    if (nextPage === page) return;

    setListLoading(true);
    fetchPage(nextPage)
      .then((res) => {
        setItems(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setListLoading(false));
  }

  /** Re-fetches page 0 unconditionally (e.g. after creating/deleting an item), propagating errors. */
  function reload() {
    setListLoading(true);
    return fetchPage(0)
      .then((res) => {
        setItems(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .finally(() => setListLoading(false));
  }

  return {
    items,
    setItems,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
    reload,
  };
}
