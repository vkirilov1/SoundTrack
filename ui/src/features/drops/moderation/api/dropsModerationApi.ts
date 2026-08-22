import type { PagedResponse } from "../../../../types/api";
import { fetchJson } from "../../../../lib/api-client";
import type { AlbumSuggestion } from "../types";

export function getAlbumSuggestions(
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSuggestion>> {
  return fetchJson(`/admin/drops/suggestions?page=${page}&size=${size}`);
}

export function approveAlbumSuggestion(
  suggestionId: number,
): Promise<AlbumSuggestion> {
  return fetchJson(`/admin/drops/suggestions/${suggestionId}/approve`, {
    method: "POST",
  });
}

export function rejectAlbumSuggestion(
  suggestionId: number,
): Promise<AlbumSuggestion> {
  return fetchJson(`/admin/drops/suggestions/${suggestionId}/reject`, {
    method: "POST",
  });
}
