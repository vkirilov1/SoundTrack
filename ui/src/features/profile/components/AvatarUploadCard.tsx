import { useState } from "react";
import { ApiError } from "../../../lib/api-error";
import { usePhotoUpload } from "../../../hooks/usePhotoUpload";
import styles from "./AvatarUploadCard.module.css";

interface AvatarUploadCardProps {
  avatarSrc: string;
  username: string;
  onUpload: (file: File) => Promise<unknown>;
  onReset: () => Promise<unknown>;
}

function AvatarUploadCard({
  avatarSrc,
  username,
  onUpload,
  onReset,
}: AvatarUploadCardProps) {
  const {
    fileInputRef,
    selectedFile,
    preview,
    uploading,
    error: uploadError,
    handleFileChange,
    confirmUpload,
    resetInput,
  } = usePhotoUpload(onUpload, {
    requireConfirm: true,
    errorFallback: "Upload failed. Please try again.",
  });

  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleResetPhoto() {
    setResetError(null);
    setResetting(true);

    try {
      await onReset();
      resetInput();
    } catch (error) {
      setResetError(
        error instanceof ApiError
          ? error.message
          : "Reset failed. Please try again.",
      );
    } finally {
      setResetting(false);
    }
  }

  const photoError = uploadError ?? resetError;

  return (
    <div className={styles.photoRow}>
      <div className={styles.avatarCol}>
        <img
          src={preview ?? avatarSrc}
          alt={username}
          className={styles.avatar}
        />
        <button
          type="button"
          className={styles.resetLink}
          onClick={handleResetPhoto}
          disabled={resetting}
        >
          {resetting ? "Resetting…" : "Reset to Default"}
        </button>
      </div>

      <div className={styles.uploadCol}>
        <label className={styles.chooseFile}>
          Choose File
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </label>
        <p className={styles.hint}>
          Image will be cropped to a circular shape, similar to the example
        </p>
        {photoError && <p className={styles.error}>{photoError}</p>}
        <button
          type="button"
          className={styles.uploadButton}
          onClick={confirmUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default AvatarUploadCard;
