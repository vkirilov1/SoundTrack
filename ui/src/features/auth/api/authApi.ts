import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserProfile,
} from "../../../types/auth";
import { apiFetch, fetchJson } from "../../../lib/api-client";
import {
  throwFieldApiError,
  throwMessageApiError,
} from "../../../lib/api-error";

export async function register(payload: RegisterRequest): Promise<UserProfile> {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwFieldApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export function login(payload: LoginRequest): Promise<UserProfile> {
  return fetchJson("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await apiFetch("/auth/me");

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<void> {
  const response = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwFieldApiError(response);
  }
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<void> {
  const response = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwFieldApiError(response);
  }
}

export async function restoreAccount(token: string): Promise<void> {
  const response = await apiFetch("/auth/restore-account", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}
