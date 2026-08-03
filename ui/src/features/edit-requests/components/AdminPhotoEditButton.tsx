import EditIcon from "../../../components/EditIcon/EditIcon";
import { usePhotoUpload } from "../../../hooks/usePhotoUpload";
import styles from "./AdminPhotoEditButton.module.css";

interface AdminPhotoEditButtonProps {
  onSavePhoto: (file: File) => Promise<unknown>;
  label?: string;
}

function AdminPhotoEditButton({
  onSavePhoto,
  label = "Change photo",
}: AdminPhotoEditButtonProps) {
  const { fileInputRef, uploading, error, handleFileChange } =
    usePhotoUpload(onSavePhoto);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
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
