import { Flex, Text, chakra } from "@chakra-ui/react";
import ArrowLeftIcon from "../../../components/icons/ArrowLeftIcon";

interface ChatSectionHeaderProps {
  title: string;
  onBack: () => void;
}

/** Back-to-messages header shared by ChatPanel's members and invite sub-views. */
function ChatSectionHeader({ title, onBack }: ChatSectionHeaderProps) {
  return (
    <Flex
      align="center"
      gap="8px"
      px="12px"
      py="8px"
      borderBottom="1px solid"
      borderColor="border"
    >
      <chakra.button
        type="button"
        onClick={onBack}
        aria-label="Back to messages"
        display="inline-flex"
        p="4px"
        bg="none"
        border="none"
        color="text"
        cursor="pointer"
        _hover={{ color: "ink" }}
      >
        <ArrowLeftIcon size={15} />
      </chakra.button>
      <Text m="0" fontSize="13px" fontWeight="600" color="ink">
        {title}
      </Text>
    </Flex>
  );
}

export default ChatSectionHeader;
