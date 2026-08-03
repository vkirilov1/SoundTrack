import { submitEditRequest } from "../api/editRequestApi";
import type { EditRequestTargetType } from "../types";
import InlineTextEditForm from "./InlineTextEditForm";
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
  return (
    <InlineTextEditForm
      currentText={currentDescription}
      onSubmit={(text) => submitEditRequest(targetType, targetId, text)}
      onEditingChange={onEditingChange}
      submitLabel="Submit suggestion"
      submittingLabel="Submitting…"
      errorFallback="Couldn't submit your suggestion."
      disallowEmpty
      successMessage="Thanks! Your suggestion is pending review."
      renderTrigger={(open) => (
        <button type="button" className={styles.link} onClick={open}>
          Suggest an edit
        </button>
      )}
      classNames={{
        form: styles.form,
        textarea: styles.textarea,
        error: styles.error,
        actions: styles.actions,
        cancelButton: styles.cancelButton,
        submitButton: styles.submitButton,
        successMessage: styles.submitted,
      }}
    />
  );
}

export default SuggestEditLink;
