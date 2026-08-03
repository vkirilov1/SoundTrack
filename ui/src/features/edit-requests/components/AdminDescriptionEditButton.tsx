import EditIcon from "../../../components/EditIcon/EditIcon";
import InlineTextEditForm from "./InlineTextEditForm";
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
  return (
    <InlineTextEditForm
      currentText={currentDescription}
      onSubmit={onSaveDescription}
      onEditingChange={onEditingChange}
      submitLabel="Save"
      submittingLabel="Saving…"
      errorFallback="Couldn't save."
      autoFocusTextarea
      renderTrigger={(open) => (
        <button
          type="button"
          className={styles.editButton}
          onClick={open}
          aria-label="Edit description"
          title="Edit description"
        >
          <EditIcon size={14} />
          <span>Edit description</span>
        </button>
      )}
      classNames={{
        form: styles.form,
        textarea: styles.textarea,
        error: styles.error,
        actions: styles.actions,
        cancelButton: styles.cancelButton,
        submitButton: styles.saveButton,
      }}
    />
  );
}

export default AdminDescriptionEditButton;
