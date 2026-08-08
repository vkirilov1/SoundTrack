import { throwMessageApiError } from "./api-error";

const API_BASE = "/api";

// Auth endpoints handle their own 401 semantics (bad credentials, expired refresh
// token, etc.) and must never trigger the retry loop below, or a bad login could
// recurse into itself via the refresh call.
const NO_RETRY_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

// Fires after a silent token refresh succeeds, so cached identity (e.g. the
// header's currentUser) can resync instead of going stale until a manual reload.
type SessionRefreshedHandler = () => void;
let onSessionRefreshed: SessionRefreshedHandler | null = null;

export function setSessionRefreshedHandler(
  handler: SessionRefreshedHandler | null,
) {
  onSessionRefreshed = handler;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Silently renews the access token cookie via the refresh token. Exported so long-lived
 * non-fetch connections (the notification SSE stream) can proactively refresh before
 * reconnecting, since they can't rely on apiFetch's automatic 401-retry-refresh.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function doFetch(path: string, init: RequestInit): Promise<Response> {
  const isFormData = init.body instanceof FormData;

  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: isFormData
      ? init.headers
      : { "Content-Type": "application/json", ...init.headers },
  });
}

/**
 * fetch wrapper for the API: always sends the httpOnly auth cookies, and on a 401
 * from a protected endpoint, silently tries to refresh the session once and
 * retries the original request before giving up.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await doFetch(path, init);

  if (response.status !== 401 || NO_RETRY_PATHS.has(path)) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    onUnauthorized?.();
    return response;
  }

  onSessionRefreshed?.();
  return doFetch(path, init);
}

/** apiFetch + throw a message-based ApiError on failure + parse the JSON response body. */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<T>;
}

/** apiFetch + throw a message-based ApiError on failure, for endpoints with no response body. */
export async function fetchOk(path: string, init?: RequestInit): Promise<void> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}
