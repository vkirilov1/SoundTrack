import type { PagedResponse } from "../../../types/api";
import type { AlbumDetail } from "../../../types/album";
import { fetchJson, fetchOk } from "../../../lib/api-client";
import type { CreateAlbumPayload } from "../../edit-requests/api/adminContentApi";
import type { UpcomingRelease } from "../types";

export function getUpcomingReleases(
  page = 0,
  size = 20,
): Promise<PagedResponse<UpcomingRelease>> {
  return fetchJson(`/drops/upcoming?page=${page}&size=${size}`);
}

export function createUpcomingRelease(
  payload: CreateAlbumPayload,
): Promise<UpcomingRelease> {
  return fetchJson(`/admin/upcoming-releases`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadUpcomingReleasePhoto(
  id: number,
  file: File,
): Promise<UpcomingRelease> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchJson(`/admin/upcoming-releases/${id}/photo`, {
    method: "POST",
    body: formData,
  });
}

export function publishUpcomingRelease(id: number): Promise<AlbumDetail> {
  return fetchJson(`/admin/upcoming-releases/${id}/publish`, {
    method: "POST",
  });
}

export function deleteUpcomingRelease(id: number): Promise<void> {
  return fetchOk(`/admin/upcoming-releases/${id}`, { method: "DELETE" });
}
