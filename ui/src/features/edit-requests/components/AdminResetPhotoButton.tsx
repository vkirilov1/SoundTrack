import { useState } from "react";
import { Text, VStack } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import UnderlineTextButton from "../../../components/buttons/UnderlineTextButton";

interface AdminResetPhotoButtonProps {
  onReset: () => Promise<unknown>;
  label?: string;
}

function AdminResetPhotoButton({
  onReset,
  label = "Reset to default",
}: AdminResetPhotoButtonProps) {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setResetting(true);
    setError(null);

    onReset()
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Reset failed.");
      })
      .finally(() => setResetting(false));
  }

  return (
    <VStack mt="8px" align="center" gap="4px">
      <UnderlineTextButton
        onClick={handleClick}
        disabled={resetting}
        fontSize="13px"
      >
        {resetting ? "Resetting…" : label}
      </UnderlineTextButton>
      {error && (
        <Text fontSize="12px" color="danger" m="0">
          {error}
        </Text>
      )}
    </VStack>
  );
}

export default AdminResetPhotoButton;
