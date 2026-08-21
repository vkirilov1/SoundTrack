import { useState } from "react";
import { Box, Flex, Text, VStack, chakra } from "@chakra-ui/react";
import PillButton from "../../../../components/buttons/PillButton";
import { SHORT_DATE_FORMAT } from "../../../../utils/date";
import { getChatReportDetail } from "../api/chatModerationApi";
import {
  REPORT_CATEGORY_LABELS,
  type ChatReport,
  type ChatReportMessage,
} from "../types";

const STATUS_COLORS: Record<ChatReport["status"], string> = {
  OPEN: "danger",
  HANDLING: "accent",
  RESOLVED: "text",
};

interface ChatReportRowProps {
  report: ChatReport;
  onJoinRoom: (roomId: number) => void;
  onDelete: (roomId: number) => void;
  onDismiss: (reportId: number) => void;
  joinError?: string;
  actionPending?: boolean;
}

function ChatReportRow({
  report,
  onJoinRoom,
  onDelete,
  onDismiss,
  joinError,
  actionPending,
}: ChatReportRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatReportMessage[] | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const resolved = report.status === "RESOLVED";

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next && messages === null) {
      setLoadingMessages(true);
      getChatReportDetail(report.id)
        .then((detail) => setMessages(detail.messages))
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));
    }
  }

  return (
    <Box
      as="li"
      pb="16px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ pb: 0, borderBottom: "none" }}
    >
      <Flex align="flex-start" gap="12px">
        <Box flex="1" minW="0">
          <Flex align="center" gap="8px" wrap="wrap">
            <Text m="0" fontSize="15px" fontWeight="600" color="ink">
              {report.roomName}
            </Text>
            <Text
              as="span"
              fontSize="11px"
              fontWeight="700"
              textTransform="uppercase"
              color={STATUS_COLORS[report.status]}
            >
              {report.status}
            </Text>
          </Flex>
          {report.topicName && (
            <Text m="0" fontSize="12px" color="text" opacity="0.8">
              {report.topicName}
            </Text>
          )}
          <Text m="0" mt="4px" fontSize="12px" color="text">
            {REPORT_CATEGORY_LABELS[report.category]}
            {report.reporterUsername && (
              <> · reported by {report.reporterUsername}</>
            )}
            {" · "}
            {SHORT_DATE_FORMAT.format(new Date(report.createdAt))}
          </Text>
          {report.status === "HANDLING" && report.handledByUsername && (
            <Text m="0" mt="2px" fontSize="12px" color="accent">
              Being handled by {report.handledByUsername}
            </Text>
          )}
          {resolved && (
            <Text m="0" mt="2px" fontSize="12px" color="text">
              Resolved
              {report.resolvedByUsername
                ? ` by ${report.resolvedByUsername}`
                : ""}
              {" - "}
              {report.resolution === "ROOM_DELETED"
                ? "room deleted"
                : "dismissed"}
            </Text>
          )}
          {joinError && (
            <Text m="0" mt="4px" fontSize="12px" color="danger">
              {joinError}
            </Text>
          )}

          <chakra.button
            type="button"
            onClick={toggleExpanded}
            mt="6px"
            fontSize="12px"
            fontWeight="600"
            bg="none"
            border="none"
            color="accent"
            cursor="pointer"
            _hover={{ color: "accentHover" }}
          >
            {expanded ? "Hide context" : "Show context"}
          </chakra.button>

          {expanded && (
            <VStack
              align="stretch"
              gap="4px"
              mt="8px"
              p="10px"
              bg="border"
              borderRadius="md"
              maxH="220px"
              overflowY="auto"
            >
              {loadingMessages && (
                <Text m="0" fontSize="12px" color="text">
                  Loading…
                </Text>
              )}
              {!loadingMessages && messages?.length === 0 && (
                <Text m="0" fontSize="12px" color="text">
                  No messages captured.
                </Text>
              )}
              {!loadingMessages &&
                messages?.map((m, i) => (
                  <Text key={i} m="0" fontSize="12px" color="ink">
                    <chakra.span fontWeight="600">
                      {m.senderUsername}:{" "}
                    </chakra.span>
                    {m.content}
                  </Text>
                ))}
            </VStack>
          )}
        </Box>

        {!resolved && (
          <Flex flexShrink="0" gap="6px" wrap="wrap" justify="flex-end">
            <PillButton
              onClick={() => onJoinRoom(report.roomId)}
              disabled={actionPending}
              fontSize="12px"
              px="12px"
              py="5px"
            >
              Join
            </PillButton>
            <PillButton
              onClick={() => onDelete(report.roomId)}
              disabled={actionPending}
              muted
              fontSize="12px"
              px="12px"
              py="5px"
              color="danger"
            >
              Delete room
            </PillButton>
            <PillButton
              onClick={() => onDismiss(report.id)}
              disabled={actionPending}
              muted
              fontSize="12px"
              px="12px"
              py="5px"
            >
              Dismiss
            </PillButton>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export default ChatReportRow;
