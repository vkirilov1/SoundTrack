import { useEffect, useState } from "react";
import CheckIcon from "../CheckIcon/CheckIcon";
import Spinner from "../Spinner/Spinner";
import XIcon from "../XIcon/XIcon";
import styles from "./ConfirmDeleteControl.module.css";

type DeleteStatus = "idle" | "confirming" | "deleting";

interface ConfirmDeleteControlProps {
  onDelete: () => Promise<unknown>;
  label?: string;
  confirmMessage?: string;
  /** Reports internal status changes, e.g. to hide a sibling "Edit" button while confirming. */
  onStatusChange?: (status: DeleteStatus) => void;
}

function ConfirmDeleteControl({
  onDelete,
  label = "Delete",
  confirmMessage = "Delete this?",
  onStatusChange,
}: ConfirmDeleteControlProps) {
  const [status, setStatus] = useState<DeleteStatus>("idle");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  function handleDelete() {
    setStatus("deleting");
    onDelete().catch(() => setStatus("confirming"));
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        className={styles.deleteButton}
        onClick={() => setStatus("confirming")}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={styles.confirmRow}>
      <span className={styles.confirmText}>{confirmMessage}</span>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.confirmDeleteIconButton}`}
        onClick={handleDelete}
        disabled={status === "deleting"}
        aria-label="Confirm delete"
        title="Confirm delete"
      >
        {status === "deleting" ? (
          <Spinner size={14} label="Deleting" />
        ) : (
          <CheckIcon />
        )}
      </button>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.cancelDeleteIconButton}`}
        onClick={() => setStatus("idle")}
        disabled={status === "deleting"}
        aria-label="Cancel delete"
        title="Cancel"
      >
        <XIcon />
      </button>
    </div>
  );
}

export default ConfirmDeleteControl;
