import { useEffect, useState } from "react";
import { HStack, IconButton, Text } from "@chakra-ui/react";
import CheckIcon from "../icons/CheckIcon";
import Spinner from "../Spinner/Spinner";
import TextButton from "../buttons/TextButton";
import XIcon from "../icons/XIcon";

type DeleteStatus = "idle" | "confirming" | "deleting";

interface ConfirmDeleteControlProps {
  onDelete: () => Promise<unknown>;
  label?: string;
  confirmMessage?: string;
  /** Reports internal status changes, e.g. to hide a sibling "Edit" button while confirming. */
  onStatusChange?: (status: DeleteStatus) => void;
}

function ConfirmDeleteControl({
  onDelete,
  label = "Delete",
  confirmMessage = "Delete this?",
  onStatusChange,
}: ConfirmDeleteControlProps) {
  const [status, setStatus] = useState<DeleteStatus>("idle");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  function handleDelete() {
    setStatus("deleting");
    onDelete().catch(() => setStatus("confirming"));
  }

  if (status === "idle") {
    return (
      <TextButton tone="danger" onClick={() => setStatus("confirming")}>
        {label}
      </TextButton>
    );
  }

  return (
    <HStack align="center" gap="10px">
      <Text fontSize="13px" color="text">
        {confirmMessage}
      </Text>
      <IconButton
        onClick={handleDelete}
        disabled={status === "deleting"}
        aria-label="Confirm delete"
        title="Confirm delete"
        w="30px"
        h="30px"
        minW="30px"
        borderRadius="full"
        bg="danger"
        color="white"
        _hover={{ bg: "dangerHover" }}
        _disabled={{ opacity: 0.6, cursor: "default" }}
      >
        {status === "deleting" ? (
          <Spinner size={14} label="Deleting" />
        ) : (
          <CheckIcon />
        )}
      </IconButton>
      <IconButton
        onClick={() => setStatus("idle")}
        disabled={status === "deleting"}
        aria-label="Cancel delete"
        title="Cancel"
        w="30px"
        h="30px"
        minW="30px"
        borderRadius="full"
        bg="border"
        color="text"
        _hover={{ bg: "border", color: "ink", opacity: 0.85 }}
        _disabled={{ opacity: 0.6, cursor: "default" }}
      >
        <XIcon />
      </IconButton>
    </HStack>
  );
}

export default ConfirmDeleteControl;
