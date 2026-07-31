import type { AlbumDetail } from "../types";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

export async function getAlbum(id: number): Promise<AlbumDetail> {
  const response = await apiFetch(`/albums/${id}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (body as { message?: string }).message ?? "Request failed.",
    );
  }

  return response.json() as Promise<AlbumDetail>;
}
