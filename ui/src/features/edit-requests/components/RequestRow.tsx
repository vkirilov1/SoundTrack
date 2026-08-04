import { Box, HStack, IconButton, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CheckIcon from "../../../components/icons/CheckIcon";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import XIcon from "../../../components/icons/XIcon";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import type { EditRequest } from "../types";

interface RequestRowProps {
  request: EditRequest;
  status: "idle" | "working";
  actionError?: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function RequestRow({
  request,
  status,
  actionError,
  onApprove,
  onReject,
}: RequestRowProps) {
  const targetHref =
    request.targetType === "ALBUM"
      ? `/album/${request.targetId}`
      : `/artist/${request.targetId}`;
  const imageSrc = request.targetPhotoUrl
    ? request.targetType === "ALBUM"
      ? coverImageUrl(request.targetPhotoUrl)
      : artistImageUrl(request.targetPhotoUrl)
    : null;
  const working = status === "working";

  return (
    <Box
      as="li"
      pb="20px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ pb: 0, borderBottom: "none" }}
    >
      <HStack align="flex-start" gap="16px">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            flexShrink="0"
            boxSize="72px"
            borderRadius="md"
            objectFit="cover"
            bg="border"
          />
        ) : (
          <Box
            as="span"
            aria-hidden="true"
            flexShrink="0"
            boxSize="72px"
            borderRadius="md"
            bg="border"
          />
        )}

        <Box flex="1" minW="0" display="flex" flexDirection="column" gap="2px">
          <Link
            asChild
            fontSize="16px"
            fontWeight="600"
            color="ink"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to={targetHref}>{request.targetName}</RouterLink>
          </Link>
          <Text fontSize="12px" color="accent" fontWeight="600">
            {request.targetType === "ALBUM" ? "Album" : "Artist"} description
          </Text>
          <Text fontSize="12px" color="text" opacity="0.7">
            Submitted by{" "}
            <Link
              asChild
              color="text"
              fontWeight="600"
              textDecoration="none"
              _hover={{ color: "ink" }}
            >
              <RouterLink to={`/profile/${request.requestedByUserId}`}>
                {request.requestedByUsername}
              </RouterLink>
            </Link>{" "}
            on {SHORT_DATE_FORMAT.format(new Date(request.createdAt))}
          </Text>
          <Text
            mt="6px"
            fontSize="14px"
            lineHeight="1.5"
            color="text"
            whiteSpace="pre-wrap"
          >
            {request.proposedDescription}
          </Text>
        </Box>

        {request.status === "PENDING" ? (
          <HStack flexShrink="0" gap="8px">
            <IconButton
              onClick={() => onApprove(request.id)}
              disabled={working}
              aria-label="Approve"
              title="Approve"
              w="32px"
              h="32px"
              minW="32px"
              borderRadius="full"
              border="1px solid"
              borderColor="border"
              bg="none"
              color="success"
              _hover={
                working
                  ? undefined
                  : { borderColor: "success", bg: "rgba(26, 127, 55, 0.08)" }
              }
              _disabled={{ opacity: 0.6, cursor: "default" }}
            >
              <CheckIcon size={16} />
            </IconButton>
            <IconButton
              onClick={() => onReject(request.id)}
              disabled={working}
              aria-label="Reject"
              title="Reject"
              w="32px"
              h="32px"
              minW="32px"
              borderRadius="full"
              border="1px solid"
              borderColor="border"
              bg="none"
              color="danger"
              _hover={
                working
                  ? undefined
                  : { borderColor: "danger", bg: "rgba(179, 38, 30, 0.08)" }
              }
              _disabled={{ opacity: 0.6, cursor: "default" }}
            >
              <XIcon size={16} />
            </IconButton>
          </HStack>
        ) : (
          <Text
            flexShrink="0"
            fontSize="12px"
            fontWeight="600"
            color={request.status === "APPROVED" ? "success" : "danger"}
          >
            {request.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
            {request.reviewedByUsername}
          </Text>
        )}
      </HStack>

      {actionError && (
        <Box mt="12px" ml="88px" role="alert">
          <FormErrorBanner>{actionError}</FormErrorBanner>
        </Box>
      )}
    </Box>
  );
}

export default RequestRow;
