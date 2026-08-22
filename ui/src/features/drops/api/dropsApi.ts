import { fetchOk } from "../../../lib/api-client";

export interface SuggestAlbumPayload {
  title: string;
  artistName: string;
  releaseDate: string | null;
  note: string | null;
}

export function suggestAlbum(payload: SuggestAlbumPayload): Promise<void> {
  return fetchOk(`/drops/suggestions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
