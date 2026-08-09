import type { ChangeEvent } from "react";
import { Box, HStack, Image, Text } from "@chakra-ui/react";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import SelectImageButton from "./SelectImageButton";

interface PhotoPickerFieldProps {
  label: string;
  preview: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Label + preview thumbnail (or placeholder) + hidden file input, for a "stage a photo before submit" form field. */
function PhotoPickerField({ label, preview, onChange }: PhotoPickerFieldProps) {
  return (
    <Box>
      <Text fontSize="14px" fontWeight="500" color="ink" mb="8px">
        {label}
      </Text>
      <HStack gap="14px" align="center">
        {preview ? (
          <Image
            src={preview}
            alt=""
            boxSize="80px"
            borderRadius="md"
            objectFit="cover"
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="80px"
            flexShrink="0"
            border="1.5px dashed"
            borderColor="border"
            borderRadius="md"
            color="text"
            opacity="0.55"
          >
            <ImagePlaceholderIcon size={28} />
          </Box>
        )}
        <SelectImageButton handleFileChange={onChange} />
      </HStack>
    </Box>
  );
}

export default PhotoPickerField;
