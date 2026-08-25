/** spring.servlet.multipart.max-file-size (application.properties). */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function imageSizeError(file: File): string | null {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image is too large. Maximum size is 5MB.";
  }
  return null;
}
