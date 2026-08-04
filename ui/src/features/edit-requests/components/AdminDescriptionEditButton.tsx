import EditIcon from "../../../components/icons/EditIcon";
import TextButton from "../../../components/buttons/TextButton";
import InlineTextEditForm from "./InlineTextEditForm";

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
        <TextButton
          onClick={open}
          aria-label="Edit description"
          title="Edit description"
          display="inline-flex"
          alignItems="center"
          gap="6px"
        >
          <EditIcon size={14} />
          <span>Edit description</span>
        </TextButton>
      )}
    />
  );
}

export default AdminDescriptionEditButton;
