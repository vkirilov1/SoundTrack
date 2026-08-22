import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import ChevronUpIcon from "../../../components/icons/ChevronUpIcon";
import UsersIcon from "../../../components/icons/UsersIcon";
import XIcon from "../../../components/icons/XIcon";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import ChatPanel from "./ChatPanel";

function ChatDock() {
  const { user } = useAuth();
  const {
    phase,
    expanded,
    unseenCount,
    setExpanded,
    cancelPending,
    dismissEnded,
  } = useChat();

  if (!user || phase.kind === "idle") return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      right={{ base: "0", sm: "24px" }}
      zIndex="900"
      w={{ base: "100%", sm: "360px" }}
      maxW="100vw"
    >
      {phase.kind === "ended" && (
        <Flex
          align="center"
          gap="10px"
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderBottom="none"
          borderTopRadius="lg"
          boxShadow="0 -4px 24px rgba(0, 0, 0, 0.15)"
          px="14px"
          py="12px"
        >
          <Text flex="1" m="0" fontSize="13px" color="ink">
            {phase.reason === "closed" &&
              `“${phase.roomName}” has ended - the owner left the chat.`}
            {phase.reason === "kicked" &&
              `You were removed from “${phase.roomName}”.`}
            {phase.reason === "declined" &&
              `Your request to join “${phase.roomName}” was declined.`}
          </Text>
          <chakra.button
            type="button"
            onClick={dismissEnded}
            aria-label="Dismiss"
            display="inline-flex"
            bg="none"
            border="none"
            color="text"
            cursor="pointer"
            _hover={{ color: "ink" }}
          >
            <XIcon size={14} />
          </chakra.button>
        </Flex>
      )}

      {phase.kind === "pending" && (
        <Flex
          align="center"
          gap="10px"
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderBottom="none"
          borderTopRadius="lg"
          boxShadow="0 -4px 24px rgba(0, 0, 0, 0.15)"
          px="14px"
          py="12px"
        >
          <Box flex="1" minW="0">
            <Text m="0" fontSize="13px" fontWeight="600" color="ink" truncate>
              {phase.room.name}
            </Text>
            <Text m="0" fontSize="12px" color="text">
              Waiting for the owner to approve your request…
            </Text>
          </Box>
          <chakra.button
            type="button"
            onClick={() => void cancelPending()}
            fontSize="12px"
            fontWeight="600"
            bg="none"
            border="none"
            color="danger"
            cursor="pointer"
            whiteSpace="nowrap"
            _hover={{ textDecoration: "underline" }}
          >
            Cancel
          </chakra.button>
        </Flex>
      )}

      {phase.kind === "active" && !expanded && (
        <chakra.button
          type="button"
          onClick={() => setExpanded(true)}
          w="100%"
          display="flex"
          alignItems="center"
          gap="10px"
          bg="inkBlack"
          border="none"
          borderTopRadius="lg"
          boxShadow="0 -4px 24px rgba(0, 0, 0, 0.25)"
          px="14px"
          py="12px"
          cursor="pointer"
          textAlign="left"
        >
          <Text
            flex="1"
            m="0"
            fontSize="13px"
            fontWeight="600"
            color="white"
            truncate
          >
            {phase.room.name}
          </Text>
          {unseenCount > 0 && (
            <Box
              minW="18px"
              h="18px"
              px="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="danger"
              color="white"
              fontSize="11px"
              fontWeight="700"
              borderRadius="full"
              lineHeight="1"
            >
              {unseenCount > 9 ? "9+" : unseenCount}
            </Box>
          )}
          <Flex align="center" gap="4px" color="whiteAlpha.800" fontSize="12px">
            <UsersIcon size={14} />
            {phase.room.memberCount}/{phase.room.maxCapacity}
          </Flex>
          <Box color="whiteAlpha.800">
            <ChevronUpIcon size={16} />
          </Box>
        </chakra.button>
      )}

      {phase.kind === "active" && expanded && <ChatPanel room={phase.room} />}
    </Box>
  );
}

export default ChatDock;
