import type { LoginRequest, RegisterRequest, UserProfile } from "../../../types/auth";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

export async function register(payload: RegisterRequest): Promise<UserProfile> {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function login(payload: LoginRequest): Promise<UserProfile> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await apiFetch("/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}
