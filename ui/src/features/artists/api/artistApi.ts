import type { ArtistDetail } from "../types";
import { fetchJson } from "../../../lib/api-client";

export function getArtist(id: number): Promise<ArtistDetail> {
  return fetchJson(`/artists/${id}`);
}
