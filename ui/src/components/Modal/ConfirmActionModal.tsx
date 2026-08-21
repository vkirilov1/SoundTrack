import { useState, type ReactNode } from "react";
import { HStack, Text, chakra } from "@chakra-ui/react";
import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import SecondaryButton from "../buttons/SecondaryButton";

const TONE_STYLES = {
  accent: { bg: "accent", hoverBg: "accentHover" },
  danger: { bg: "danger", hoverBg: "dangerHover" },
} as const;

interface ConfirmActionModalProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmingLabel?: string;
  tone?: "accent" | "danger";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  maxW?: string;
}

/**
 * Generic confirm/cancel modal. If onConfirm returns a promise, the modal stays open and shows a
 * busy state until it settles, closing on success and re-enabling the buttons on failure.
 */
function ConfirmActionModal({
  title,
  message,
  confirmLabel,
  confirmingLabel,
  tone = "accent",
  onConfirm,
  onClose,
  maxW = "420px",
}: ConfirmActionModalProps) {
  const [busy, setBusy] = useState(false);

  function handleConfirm() {
    const result = onConfirm();
    if (!(result instanceof Promise)) {
      onClose();
      return;
    }
    setBusy(true);
    result.then(onClose).catch(() => setBusy(false));
  }

  const label = busy && confirmingLabel ? confirmingLabel : confirmLabel;
  const { bg, hoverBg } = TONE_STYLES[tone];

  return (
    <Modal onClose={onClose} maxW={maxW}>
      <ModalHeader title={title} onClose={onClose} />

      <Text m="0" p="24px" fontSize="14px" color="ink" lineHeight="1.5">
        {message}
      </Text>

      <HStack
        justify="flex-end"
        gap="10px"
        p="16px 24px"
        borderTop="1px solid"
        borderColor="border"
      >
        <SecondaryButton
          onClick={onClose}
          disabled={busy}
          fontSize="13px"
          px="16px"
          py="8px"
        >
          Cancel
        </SecondaryButton>

        <chakra.button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          bg={bg}
          color="white"
          fontSize="13px"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.4px"
          border="none"
          borderRadius="md"
          px="16px"
          py="8px"
          cursor="pointer"
          _hover={{ bg: hoverBg }}
          _disabled={{ opacity: 0.7, cursor: "default" }}
        >
          {label}
        </chakra.button>
      </HStack>
    </Modal>
  );
}

export default ConfirmActionModal;
