const IMAGE_BASE = "/api/images";

export function coverImageUrl(filename: string): string {
  return `${IMAGE_BASE}/covers/${filename}`;
}

export function artistImageUrl(filename: string): string {
  return `${IMAGE_BASE}/artists/${filename}`;
}

export function userPhotoUrl(filename: string): string {
  return `${IMAGE_BASE}/users/${filename}`;
}
