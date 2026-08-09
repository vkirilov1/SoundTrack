import { HStack } from "@chakra-ui/react";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";

interface ModalFormFooterProps {
  onCancel: () => void;
  canSubmit: boolean;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
}

function ModalFormFooter({
  onCancel,
  canSubmit,
  submitting,
  submitLabel,
  submittingLabel,
}: ModalFormFooterProps) {
  return (
    <HStack
      justify="flex-end"
      gap="10px"
      p="16px 24px"
      borderTop="1px solid"
      borderColor="border"
    >
      <SecondaryButton
        onClick={onCancel}
        disabled={submitting}
        fontSize="13px"
        px="16px"
        py="8px"
      >
        Cancel
      </SecondaryButton>
      <PrimaryButton
        type="submit"
        disabled={!canSubmit}
        fontSize="13px"
        px="16px"
        py="8px"
        h="auto"
      >
        {submitting ? submittingLabel : submitLabel}
      </PrimaryButton>
    </HStack>
  );
}

export default ModalFormFooter;
