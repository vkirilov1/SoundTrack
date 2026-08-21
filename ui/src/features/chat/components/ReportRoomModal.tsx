import { useState, type SubmitEvent } from "react";
import { Field, Text, VStack, chakra } from "@chakra-ui/react";
import Modal from "../../../components/Modal/Modal";
import ModalHeader from "../../../components/Modal/ModalHeader";
import ModalFormFooter from "../../../components/Modal/ModalFormFooter";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import { reportRoom } from "../api/chatApi";
import { ApiError } from "../../../lib/api-error";
import type { ChatReportCategory } from "../moderation/types";

const CATEGORIES: { value: ChatReportCategory; label: string }[] = [
  { value: "HARASSMENT", label: "Harassment" },
  { value: "SPAM", label: "Spam" },
  { value: "ILLEGAL_CONTENT", label: "Illegal content" },
  { value: "OTHER", label: "Other" },
];

interface ReportRoomModalProps {
  roomId: number;
  onClose: () => void;
}

function ReportRoomModal({ roomId, onClose }: ReportRoomModalProps) {
  const [category, setCategory] = useState<ChatReportCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) return;

    setSubmitting(true);
    setError(null);

    reportRoom(roomId, category)
      .then(() => setSubmitted(true))
      .catch((e: unknown) => {
        setError(
          e instanceof ApiError ? e.message : "Couldn't submit the report.",
        );
        setSubmitting(false);
      });
  }

  if (submitted) {
    return (
      <Modal onClose={onClose} maxW="420px">
        <ModalHeader title="Report Room" onClose={onClose} />
        <Text m="0" p="24px" fontSize="14px" color="ink" lineHeight="1.5">
          Thanks - an admin will review this room shortly.
        </Text>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} maxW="420px">
      <chakra.form onSubmit={handleSubmit} noValidate>
        <ModalHeader title="Report Room" onClose={onClose} />

        <VStack align="stretch" gap="14px" p="24px">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              What's wrong with this room?
            </Field.Label>
            <VStack align="stretch" gap="8px" mt="4px">
              {CATEGORIES.map(({ value, label }) => (
                <chakra.label
                  key={value}
                  display="flex"
                  alignItems="center"
                  gap="10px"
                  fontSize="14px"
                  color="ink"
                  cursor="pointer"
                >
                  <chakra.input
                    type="radio"
                    name="report-category"
                    checked={category === value}
                    onChange={() => setCategory(value)}
                    accentColor="var(--chakra-colors-accent)"
                  />
                  {label}
                </chakra.label>
              ))}
            </VStack>
          </Field.Root>
        </VStack>

        <ModalFormFooter
          onCancel={onClose}
          canSubmit={category !== null && !submitting}
          submitting={submitting}
          submitLabel="Send report"
          submittingLabel="Sending…"
        />
      </chakra.form>
    </Modal>
  );
}

export default ReportRoomModal;
