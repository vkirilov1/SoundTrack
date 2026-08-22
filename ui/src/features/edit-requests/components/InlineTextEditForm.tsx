import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SubmitEvent } from "react";
import { chakra, HStack, Text, Textarea } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";

interface InlineTextEditFormProps {
  currentText: string | null;
  onSubmit: (text: string) => Promise<unknown>;
  onEditingChange?: (editing: boolean) => void;
  renderTrigger: (open: () => void) => ReactNode;
  submitLabel: string;
  submittingLabel: string;
  errorFallback: string;
  disallowEmpty?: boolean;
  autoFocusTextarea?: boolean;
  successMessage?: string;
  variant?: "textarea" | "text" | "date";
  maxLength?: number;
  formWidth?: string;
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
  variant = "textarea",
  maxLength = 3400,
  formWidth = "100%",
}: InlineTextEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(currentText ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  useLayoutEffect(() => {
    if (variant !== "textarea") return;

    const el = textareaRef.current;
    if (!el) return;

    function resize() {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    resize();
    const raf = requestAnimationFrame(resize);
    return () => cancelAnimationFrame(raf);
  }, [text, editing, variant]);

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
    return (
      <Text fontSize="12px" color="text">
        {successMessage}
      </Text>
    );
  }

  if (!editing) {
    return <>{renderTrigger(open)}</>;
  }

  return (
    <chakra.form onSubmit={handleSubmit} w={formWidth}>
      {variant === "textarea" ? (
        <Textarea
          ref={textareaRef}
          value={text}
          maxLength={maxLength}
          onChange={(event) => setText(event.target.value)}
          autoFocus={autoFocusTextarea}
          w="100%"
          minH="96px"
          maxH="480px"
          fontSize="13px"
          color="ink"
          bg="bg"
          borderColor="border"
          borderRadius="md"
          p="8px"
          resize="vertical"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
      ) : (
        <chakra.input
          type={variant}
          value={text}
          maxLength={variant === "text" ? maxLength : undefined}
          onChange={(event) => setText(event.target.value)}
          autoFocus={autoFocusTextarea}
          w="100%"
          font="inherit"
          fontSize="13px"
          color="ink"
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          px="8px"
          py="6px"
          outline="none"
          _focus={{ borderColor: "accent" }}
        />
      )}
      {error && (
        <Text mt="6px" fontSize="12px" color="danger">
          {error}
        </Text>
      )}
      <HStack mt="8px" justify="flex-end" gap="8px">
        <SecondaryButton
          onClick={() => setEditing(false)}
          disabled={submitting}
          fontSize="12px"
          px="12px"
          py="6px"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          disabled={disabled}
          fontSize="12px"
          fontWeight="600"
          textTransform="none"
          letterSpacing="normal"
          px="12px"
          py="6px"
          h="auto"
        >
          {submitting ? submittingLabel : submitLabel}
        </PrimaryButton>
      </HStack>
    </chakra.form>
  );
}

export default InlineTextEditForm;
