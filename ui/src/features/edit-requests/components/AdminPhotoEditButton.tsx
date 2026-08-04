import { Box, chakra, Text } from "@chakra-ui/react";
import EditIcon from "../../../components/icons/EditIcon";
import { usePhotoUpload } from "../../../hooks/usePhotoUpload";

interface AdminPhotoEditButtonProps {
  onSavePhoto: (file: File) => Promise<unknown>;
  label?: string;
}

function AdminPhotoEditButton({
  onSavePhoto,
  label = "Change photo",
}: AdminPhotoEditButtonProps) {
  const { fileInputRef, uploading, error, handleFileChange } =
    usePhotoUpload(onSavePhoto);

  return (
    <Box position="absolute" top="8px" right="8px">
      <chakra.button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label={label}
        title={label}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="32px"
        h="32px"
        borderRadius="full"
        border="none"
        bg="rgba(8, 6, 13, 0.55)"
        color="white"
        cursor="pointer"
        css={{ backdropFilter: "blur(2px)" }}
        transition="background 0.15s ease, transform 0.15s ease"
        _hover={uploading ? undefined : { bg: "rgba(8, 6, 13, 0.75)" }}
        _disabled={{ opacity: 0.7, cursor: "default" }}
      >
        <EditIcon size={16} />
      </chakra.button>
      <chakra.input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        display="none"
      />
      {error && (
        <Text
          position="absolute"
          top="40px"
          right="0"
          w="200px"
          m="0"
          fontSize="12px"
          color="white"
          bg="danger"
          borderRadius="md"
          px="10px"
          py="6px"
          textAlign="right"
        >
          {error}
        </Text>
      )}
    </Box>
  );
}

export default AdminPhotoEditButton;
