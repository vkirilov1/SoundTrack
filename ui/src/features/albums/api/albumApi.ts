import type { AlbumDetail } from "../types";
import { fetchJson } from "../../../lib/api-client";

export function getAlbum(id: number): Promise<AlbumDetail> {
  return fetchJson(`/albums/${id}`);
}
