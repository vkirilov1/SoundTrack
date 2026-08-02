import type { PagedResponse } from "../../../types/api";
import type { EditRequest, EditRequestTargetType } from "../types";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

export async function submitEditRequest(
  targetType: EditRequestTargetType,
  targetId: number,
  description: string,
): Promise<void> {
  const path =
    targetType === "ALBUM"
      ? `/edit-requests/albums/${targetId}`
      : `/edit-requests/artists/${targetId}`;

  const response = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}

export async function getEditRequests(
  page = 0,
  size = 20,
): Promise<PagedResponse<EditRequest>> {
  const response = await apiFetch(
    `/admin/edit-requests?page=${page}&size=${size}`,
  );

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<PagedResponse<EditRequest>>;
}

export async function approveEditRequest(id: number): Promise<EditRequest> {
  const response = await apiFetch(`/admin/edit-requests/${id}/approve`, {
    method: "POST",
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<EditRequest>;
}

export async function rejectEditRequest(id: number): Promise<EditRequest> {
  const response = await apiFetch(`/admin/edit-requests/${id}/reject`, {
    method: "POST",
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<EditRequest>;
}
