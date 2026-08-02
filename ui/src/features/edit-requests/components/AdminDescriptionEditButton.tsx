import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import EditIcon from "../../../components/EditIcon/EditIcon";
import { ApiError } from "../../../lib/api-error";
import styles from "./AdminDescriptionEditButton.module.css";

interface AdminDescriptionEditButtonProps {
  currentDescription: string | null;
  onSaveDescription: (text: string) => Promise<unknown>;
  onEditingChange?: (editing: boolean) => void;
}

function AdminDescriptionEditButton({
  currentDescription,
  onSaveDescription,
  onEditingChange,
}: AdminDescriptionEditButtonProps) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);
  const [text, setText] = useState(currentDescription ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setText(currentDescription ?? "");
    setError(null);
    setEditing(true);
  }

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    onSaveDescription(text.trim())
      .then(() => setEditing(false))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Couldn't save.");
      })
      .finally(() => setSaving(false));
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={styles.editButton}
        onClick={startEditing}
        aria-label="Edit description"
        title="Edit description"
      >
        <EditIcon size={14} />
        <span>Edit description</span>
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <textarea
        className={styles.textarea}
        value={text}
        maxLength={3400}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        autoFocus
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={saving || text.trim() === (currentDescription ?? "")}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default AdminDescriptionEditButton;
