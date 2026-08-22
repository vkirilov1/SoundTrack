import { Box, Flex, Text } from "@chakra-ui/react";
import PillButton from "../../../../components/buttons/PillButton";
import { SHORT_DATE_FORMAT } from "../../../../utils/date";
import type { AlbumSuggestion } from "../types";

const STATUS_COLORS: Record<AlbumSuggestion["status"], string> = {
  PENDING: "danger",
  APPROVED: "success",
  REJECTED: "text",
};

interface AlbumSuggestionRowProps {
  suggestion: AlbumSuggestion;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionPending?: boolean;
}

function AlbumSuggestionRow({
  suggestion,
  onApprove,
  onReject,
  actionPending,
}: AlbumSuggestionRowProps) {
  const pending = suggestion.status === "PENDING";

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
              {suggestion.title}
            </Text>
            <Text
              as="span"
              fontSize="11px"
              fontWeight="700"
              textTransform="uppercase"
              color={STATUS_COLORS[suggestion.status]}
            >
              {suggestion.status}
            </Text>
          </Flex>
          <Text m="0" fontSize="12px" color="text" opacity="0.8">
            {suggestion.artistName}
            {suggestion.releaseDate && (
              <>
                {" · expected "}
                {SHORT_DATE_FORMAT.format(new Date(suggestion.releaseDate))}
              </>
            )}
          </Text>
          {suggestion.note && (
            <Text m="0" mt="4px" fontSize="12px" color="ink">
              “{suggestion.note}”
            </Text>
          )}
          <Text m="0" mt="4px" fontSize="12px" color="text">
            {suggestion.submittedByUsername
              ? `Suggested by ${suggestion.submittedByUsername}`
              : "Suggested by a deleted user"}
            {" · "}
            {SHORT_DATE_FORMAT.format(new Date(suggestion.createdAt))}
          </Text>
          {!pending && (
            <Text m="0" mt="2px" fontSize="12px" color="text">
              {suggestion.status === "APPROVED" ? "Approved" : "Rejected"}
              {suggestion.reviewedByUsername
                ? ` by ${suggestion.reviewedByUsername}`
                : ""}
            </Text>
          )}
        </Box>

        {pending && (
          <Flex flexShrink="0" gap="6px" wrap="wrap" justify="flex-end">
            <PillButton
              onClick={() => onApprove(suggestion.id)}
              disabled={actionPending}
              fontSize="12px"
              px="12px"
              py="5px"
            >
              Approve
            </PillButton>
            <PillButton
              onClick={() => onReject(suggestion.id)}
              disabled={actionPending}
              muted
              fontSize="12px"
              px="12px"
              py="5px"
              color="danger"
            >
              Reject
            </PillButton>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export default AlbumSuggestionRow;
