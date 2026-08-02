import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { submitEditRequest } from "../api/editRequestApi";
import { ApiError } from "../../../lib/api-error";
import type { EditRequestTargetType } from "../types";
import styles from "./SuggestEditLink.module.css";

interface SuggestEditLinkProps {
  targetType: EditRequestTargetType;
  targetId: number;
  currentDescription: string | null;
  onEditingChange?: (editing: boolean) => void;
}

function SuggestEditLink({
  targetType,
  targetId,
  currentDescription,
  onEditingChange,
}: SuggestEditLinkProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(currentDescription ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    onEditingChange?.(open);
  }, [open, onEditingChange]);

  function openForm() {
    setText(currentDescription ?? "");
    setError(null);
    setOpen(true);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    submitEditRequest(targetType, targetId, trimmed)
      .then(() => {
        setOpen(false);
        setSubmitted(true);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't submit your suggestion.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  if (submitted) {
    return (
      <p className={styles.submitted}>
        Thanks! Your suggestion is pending review.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.link} onClick={openForm}>
        Suggest an edit
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        value={text}
        maxLength={3400}
        onChange={(event) => setText(event.target.value)}
        rows={4}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={
            submitting || !text.trim() || currentDescription === text.trim()
          }
        >
          {submitting ? "Submitting…" : "Submit suggestion"}
        </button>
      </div>
    </form>
  );
}

export default SuggestEditLink;
