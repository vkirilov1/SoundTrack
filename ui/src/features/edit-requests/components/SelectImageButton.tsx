import { chakra } from "@chakra-ui/react";
import type { ChangeEvent, RefObject } from "react";

interface SelectImageButton {
  fileInputRef?: RefObject<HTMLInputElement | null>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SelectImageButton({
  fileInputRef,
  handleFileChange,
}: SelectImageButton) {
  return (
    <chakra.label
      display="inline-flex"
      alignItems="center"
      px="20px"
      py="12px"
      bg="border"
      color="text"
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
  );
}

export default SelectImageButton;
