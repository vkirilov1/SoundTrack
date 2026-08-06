import type { PagedResponse } from "../../../types/api";
import { fetchJson } from "../../../lib/api-client";
import type { AlbumSummary, ChartSortField } from "../types";

export function getTopAlbumsForYear(
  year: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  return fetchJson(`/albums/year/${year}?page=${page}&size=${size}`);
}

export function getAlbumsByGenre(
  genre: string,
  sort: ChartSortField,
  descending: boolean,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  const params = new URLSearchParams({
    sort,
    descending: String(descending),
    page: String(page),
    size: String(size),
  });
  return fetchJson(`/albums/genre/${encodeURIComponent(genre)}?${params}`);
}
