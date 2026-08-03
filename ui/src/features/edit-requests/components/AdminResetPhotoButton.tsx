import { useState } from "react";
import { ApiError } from "../../../lib/api-error";
import styles from "./AdminResetPhotoButton.module.css";

interface AdminResetPhotoButtonProps {
  onReset: () => Promise<unknown>;
  label?: string;
}

function AdminResetPhotoButton({
  onReset,
  label = "Reset to default",
}: AdminResetPhotoButtonProps) {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setResetting(true);
    setError(null);

    onReset()
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Reset failed.");
      })
      .finally(() => setResetting(false));
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        disabled={resetting}
      >
        {resetting ? "Resetting…" : label}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default AdminResetPhotoButton;
