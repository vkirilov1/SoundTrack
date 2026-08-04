import TextButton from "../../../components/buttons/TextButton";
import { submitEditRequest } from "../api/editRequestApi";
import type { EditRequestTargetType } from "../types";
import InlineTextEditForm from "./InlineTextEditForm";

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
        <TextButton onClick={open}>Suggest an edit</TextButton>
      )}
    />
  );
}

export default SuggestEditLink;
