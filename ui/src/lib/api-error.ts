import type { FieldErrors } from "../types/auth";

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldErrors;

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Throws an ApiError built from the response body's `message` field (or a fallback). */
export async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

/**
 * Same as throwMessageApiError, but treats a 400 response body as a field-name ->
 * error-message map, for forms that display per-field validation errors.
 */
export async function throwFieldApiError(response: Response): Promise<never> {
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
