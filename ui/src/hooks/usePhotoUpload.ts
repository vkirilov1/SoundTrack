import { useRef, useState, type ChangeEvent } from "react";
import { ApiError } from "../lib/api-error";

interface UsePhotoUploadOptions {
  /**
   * When true, selecting a file only stages it (with an object-URL preview)
   * until `confirmUpload()` is called. When false (default), selecting a
   * file uploads immediately.
   */
  requireConfirm?: boolean;
  errorFallback?: string;
}

export function usePhotoUpload(
  uploadFn: (file: File) => Promise<unknown>,
  {
    requireConfirm = false,
    errorFallback = "Couldn't upload photo.",
  }: UsePhotoUploadOptions = {},
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetInput() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function upload(file: File) {
    setError(null);
    setUploading(true);

    return uploadFn(file)
      .then(() => resetInput())
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : errorFallback);
      })
      .finally(() => setUploading(false));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      if (requireConfirm) resetInput();
      return;
    }

    if (requireConfirm) {
      if (preview) URL.revokeObjectURL(preview);
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      return;
    }

    upload(file);
  }

  function confirmUpload() {
    if (selectedFile) upload(selectedFile);
  }

  return {
    fileInputRef,
    selectedFile,
    preview,
    uploading,
    error,
    handleFileChange,
    confirmUpload,
    resetInput,
  };
}
