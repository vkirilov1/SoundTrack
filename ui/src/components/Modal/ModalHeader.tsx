import { Heading, HStack, chakra } from "@chakra-ui/react";
import XIcon from "../icons/XIcon";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <HStack
      justify="space-between"
      align="center"
      p="20px 24px"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Heading as="h2" fontSize="20px" m="0">
        {title}
      </Heading>
      <chakra.button
        type="button"
        onClick={onClose}
        aria-label="Close"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="28px"
        bg="none"
        border="none"
        borderRadius="full"
        color="text"
        cursor="pointer"
        _hover={{ bg: "border", color: "ink" }}
      >
        <XIcon size={14} />
      </chakra.button>
    </HStack>
  );
}

export default ModalHeader;
