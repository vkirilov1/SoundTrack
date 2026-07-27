import type {
  FieldErrors,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "../types/auth";
import { ApiError } from "./ApiError";
import { apiFetch } from "./httpClient";

async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  if (response.status === 400) {
    throw new ApiError(
      response.status,
      "Please fix the highlighted fields.",
      body as FieldErrors,
    );
  }

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
