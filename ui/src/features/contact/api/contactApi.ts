import { apiFetch } from "../../../lib/api-client";
import { throwMessageApiError } from "../../../lib/api-error";
import type { ContactRequestType } from "../types";

export interface ContactSubmission {
  type: ContactRequestType;
  message: string;
  email?: string;
  attachment?: File | null;
}

export async function submitContactRequest(
  submission: ContactSubmission,
): Promise<void> {
  const formData = new FormData();
  formData.append("type", submission.type);
  formData.append("message", submission.message);
  if (submission.email) formData.append("email", submission.email);
  if (submission.attachment)
    formData.append("attachment", submission.attachment);

  const response = await apiFetch("/contact", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}
