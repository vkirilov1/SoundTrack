import { useState } from "react";
import { Text, chakra } from "@chakra-ui/react";
import { revokeChatAccess, restoreChatAccess } from "../api/chatModerationApi";
import { ApiError } from "../../../../lib/api-error";

interface ChatAccessButtonProps {
  userId: number;
  revoked: boolean;
  onChange: (revoked: boolean) => void;
}

function ChatAccessButton({
  userId,
  revoked,
  onChange,
}: ChatAccessButtonProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setWorking(true);
    setError(null);

    const request = revoked
      ? restoreChatAccess(userId)
      : revokeChatAccess(userId);

    request
      .then(() => onChange(!revoked))
      .catch((e: unknown) =>
        setError(
          e instanceof ApiError ? e.message : "Couldn't update chat access.",
        ),
      )
      .finally(() => setWorking(false));
  }

  return (
    <>
      <chakra.button
        type="button"
        onClick={handleClick}
        disabled={working}
        mt="8px"
        fontSize="12px"
        fontWeight="600"
        px="12px"
        py="5px"
        bg="none"
        border="1px solid"
        borderColor="border"
        borderRadius="full"
        color={revoked ? "success" : "danger"}
        cursor="pointer"
        _hover={
          working ? undefined : { borderColor: revoked ? "success" : "danger" }
        }
        _disabled={{ opacity: 0.6, cursor: "default" }}
      >
        {working
          ? "Working…"
          : revoked
            ? "Restore chat access"
            : "Revoke chat access"}
      </chakra.button>
      {error && (
        <Text m="0" mt="4px" fontSize="12px" color="danger">
          {error}
        </Text>
      )}
    </>
  );
}

export default ChatAccessButton;
