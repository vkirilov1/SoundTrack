import type { ArtistDetail } from "../types";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

export async function getArtist(id: number): Promise<ArtistDetail> {
  const response = await apiFetch(`/artists/${id}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (body as { message?: string }).message ?? "Request failed.",
    );
  }

  return response.json() as Promise<ArtistDetail>;
}
