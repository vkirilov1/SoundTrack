import { useRef, useState } from "react";
import EditIcon from "../../../components/EditIcon/EditIcon";
import { ApiError } from "../../../lib/api-error";
import styles from "./AdminPhotoEditButton.module.css";

interface AdminPhotoEditButtonProps {
  onSavePhoto: (file: File) => Promise<unknown>;
  label?: string;
}

function AdminPhotoEditButton({
  onSavePhoto,
  label = "Change photo",
}: AdminPhotoEditButtonProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setError(null);

    onSavePhoto(file)
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError ? err.message : "Couldn't upload photo.",
        );
      })
      .finally(() => {
        setSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => fileInputRef.current?.click()}
        disabled={saving}
        aria-label={label}
        title={label}
      >
        <EditIcon size={16} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default AdminPhotoEditButton;
