import { useEffect, useRef, useState } from "react";
import { search, searchUsers } from "../api/searchApi";
import type { UserProfile } from "../../../types/auth";
import type { SearchResponse } from "../types";

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const EMPTY_MUSIC_RESULTS: SearchResponse = { albums: [], artists: [] };

export type SearchMode = "music" | "users";

/** Debounces `query`, re-fetching on change, and discards stale in-flight responses. */
export function useDebouncedSearch(query: string, mode: SearchMode) {
  const [musicResults, setMusicResults] =
    useState<SearchResponse>(EMPTY_MUSIC_RESULTS);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    const timer = setTimeout(() => {
      setLoading(true);

      const request = mode === "music" ? search(trimmed) : searchUsers(trimmed);

      request.then((result) => {
        if (requestId !== requestIdRef.current) return;

        if (mode === "music") {
          setMusicResults(result as SearchResponse);
        } else {
          setUserResults(result as UserProfile[]);
        }
        setLoading(false);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, mode]);

  function reset() {
    setMusicResults(EMPTY_MUSIC_RESULTS);
    setUserResults([]);
  }

  return { musicResults, userResults, loading, reset };
}
