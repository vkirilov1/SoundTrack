import type { UserProfile } from "../../../types/auth";
import type { SearchResponse } from "../types";
import { apiFetch } from "../../../lib/api-client";

const EMPTY_RESULTS: SearchResponse = { albums: [], artists: [] };

export async function search(query: string): Promise<SearchResponse> {
  const response = await apiFetch(`/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    return EMPTY_RESULTS;
  }

  return response.json() as Promise<SearchResponse>;
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const response = await apiFetch(
    `/search/users?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<UserProfile[]>;
}
