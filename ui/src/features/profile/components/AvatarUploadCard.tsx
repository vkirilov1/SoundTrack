import { useState } from "react";
import { Box, chakra, Text, VStack } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import { usePhotoUpload } from "../../../hooks/usePhotoUpload";
import Avatar from "../../../components/Avatar/Avatar";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import UnderlineTextButton from "../../../components/buttons/UnderlineTextButton";

interface AvatarUploadCardProps {
  avatarSrc: string;
  username: string;
  onUpload: (file: File) => Promise<unknown>;
  onReset: () => Promise<unknown>;
}

function AvatarUploadCard({
  avatarSrc,
  username,
  onUpload,
  onReset,
}: AvatarUploadCardProps) {
  const {
    fileInputRef,
    selectedFile,
    preview,
    uploading,
    error: uploadError,
    handleFileChange,
    confirmUpload,
    resetInput,
  } = usePhotoUpload(onUpload, {
    requireConfirm: true,
    errorFallback: "Upload failed. Please try again.",
  });

  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleResetPhoto() {
    setResetError(null);
    setResetting(true);

    try {
      await onReset();
      resetInput();
    } catch (error) {
      setResetError(
        error instanceof ApiError
          ? error.message
          : "Reset failed. Please try again.",
      );
    } finally {
      setResetting(false);
    }
  }

  const photoError = uploadError ?? resetError;

  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", sm: "row" }}
      alignItems={{ base: "center", sm: "flex-start" }}
      gap="48px"
      mb="48px"
    >
      <VStack align="center" gap="12px">
        <Avatar src={preview ?? avatarSrc} alt={username} size="140px" />
        <UnderlineTextButton onClick={handleResetPhoto} disabled={resetting}>
          {resetting ? "Resetting…" : "Reset to Default"}
        </UnderlineTextButton>
      </VStack>

      <VStack align="flex-start" gap="12px" maxW="360px" pt="4px">
        <chakra.label
          display="inline-flex"
          alignItems="center"
          px="20px"
          py="12px"
          bg="border"
          color="#8a8a92"
          fontSize="13px"
          fontWeight="600"
          textTransform="uppercase"
          letterSpacing="0.4px"
          borderRadius="md"
          cursor="pointer"
        >
          Choose File
          <chakra.input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            position="absolute"
            w="1px"
            h="1px"
            p="0"
            m="-1px"
            overflow="hidden"
            css={{ clip: "rect(0, 0, 0, 0)" }}
            whiteSpace="nowrap"
            border="0"
          />
        </chakra.label>
        <Text fontSize="13px" color="text" m="0">
          Image will be cropped to a circular shape, similar to the example
        </Text>
        {photoError && (
          <Text fontSize="13px" color="danger" m="0">
            {photoError}
          </Text>
        )}
        <PrimaryButton
          onClick={confirmUpload}
          disabled={!selectedFile || uploading}
          fontSize="14px"
          px="24px"
          py="12px"
          h="auto"
          _disabled={{ opacity: 0.6, cursor: "default" }}
        >
          {uploading ? "Uploading…" : "Upload"}
        </PrimaryButton>
      </VStack>
    </Box>
  );
}

export default AvatarUploadCard;
