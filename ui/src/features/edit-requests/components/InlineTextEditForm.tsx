import { useEffect, useState, type ReactNode } from "react";
import type { SubmitEvent } from "react";
import { ApiError } from "../../../lib/api-error";

interface InlineTextEditFormClassNames {
  form: string;
  textarea: string;
  error: string;
  actions: string;
  cancelButton: string;
  submitButton: string;
  successMessage?: string;
}

interface InlineTextEditFormProps {
  currentText: string | null;
  onSubmit: (text: string) => Promise<unknown>;
  onEditingChange?: (editing: boolean) => void;
  renderTrigger: (open: () => void) => ReactNode;
  submitLabel: string;
  submittingLabel: string;
  errorFallback: string;
  /** Blocks submitting an empty/unchanged-to-empty value (regular users suggesting edits). */
  disallowEmpty?: boolean;
  autoFocusTextarea?: boolean;
  /** Shown in place of the trigger after a successful submit, instead of resetting back to it. */
  successMessage?: string;
  classNames: InlineTextEditFormClassNames;
}

function InlineTextEditForm({
  currentText,
  onSubmit,
  onEditingChange,
  renderTrigger,
  submitLabel,
  submittingLabel,
  errorFallback,
  disallowEmpty = false,
  autoFocusTextarea = false,
  successMessage,
  classNames,
}: InlineTextEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(currentText ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  function open() {
    setText(currentText ?? "");
    setError(null);
    setEditing(true);
  }

  const trimmed = text.trim();
  const unchanged = trimmed === (currentText ?? "");
  const disabled = submitting || unchanged || (disallowEmpty && !trimmed);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || (disallowEmpty && !trimmed)) return;

    setSubmitting(true);
    setError(null);

    onSubmit(trimmed)
      .then(() => {
        setEditing(false);
        if (successMessage) setSucceeded(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : errorFallback);
      })
      .finally(() => setSubmitting(false));
  }

  if (succeeded && successMessage) {
    return <p className={classNames.successMessage}>{successMessage}</p>;
  }

  if (!editing) {
    return <>{renderTrigger(open)}</>;
  }

  return (
    <form className={classNames.form} onSubmit={handleSubmit}>
      <textarea
        className={classNames.textarea}
        value={text}
        maxLength={3400}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        autoFocus={autoFocusTextarea}
      />
      {error && <p className={classNames.error}>{error}</p>}
      <div className={classNames.actions}>
        <button
          type="button"
          className={classNames.cancelButton}
          onClick={() => setEditing(false)}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={classNames.submitButton}
          disabled={disabled}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default InlineTextEditForm;
