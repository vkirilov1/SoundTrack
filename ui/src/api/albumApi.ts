import type { AlbumDetail } from "../types/album";
import { ApiError } from "./ApiError";
import { apiFetch } from "./httpClient";

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
