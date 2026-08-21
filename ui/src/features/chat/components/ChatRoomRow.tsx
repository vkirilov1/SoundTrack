import { Box, Flex, Image, Text } from "@chakra-ui/react";
import PillButton from "../../../components/buttons/PillButton";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import LockIcon from "../../../components/icons/LockIcon";
import UsersIcon from "../../../components/icons/UsersIcon";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import type { ChatRoomInfo } from "../types";

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface ChatRoomRowProps {
  room: ChatRoomInfo;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
  error?: string | null;
}

function topicImage(room: ChatRoomInfo): string | null {
  if (!room.topicImageUrl) return null;
  return room.topicType === "ARTIST"
    ? artistImageUrl(room.topicImageUrl)
    : coverImageUrl(room.topicImageUrl);
}

function ChatRoomRow({
  room,
  actionLabel,
  actionDisabled,
  onAction,
  error,
}: ChatRoomRowProps) {
  const imageSrc = topicImage(room);
  const full = room.memberCount >= room.maxCapacity;

  return (
    <Flex
      as="li"
      align="center"
      gap="16px"
      py="16px"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Box
        flexShrink="0"
        boxSize="72px"
        borderRadius="lg"
        overflow="hidden"
        bg="border"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="text"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={room.topicName ?? room.name}
            boxSize="72px"
            objectFit="cover"
          />
        ) : (
          <ImagePlaceholderIcon size={30} />
        )}
      </Box>

      <Box flex="1" minW="0">
        <Flex align="center" gap="8px">
          <Text m="0" fontSize="18px" fontWeight="700" color="ink" truncate>
            {room.name}
          </Text>
          {room.approvalRequired && (
            <Box color="text" title="Approval required to join" flexShrink="0">
              <LockIcon size={14} />
            </Box>
          )}
        </Flex>
        <Text m="0" fontSize="13px" color="text" opacity="0.8" truncate>
          {room.topicName ?? "Unknown topic"}
        </Text>
        <Text m="0" mt="4px" fontSize="12px" color="text">
          Started {TIME_FORMAT.format(new Date(room.createdAt))} by{" "}
          {room.creator.username}
        </Text>
        <Flex align="center" gap="4px" mt="2px" fontSize="12px" color="ink">
          <UsersIcon size={13} />
          {room.memberCount} / {room.maxCapacity}
        </Flex>
        {error && (
          <Text m="0" mt="4px" fontSize="12px" color="danger">
            {error}
          </Text>
        )}
      </Box>

      <PillButton
        onClick={onAction}
        disabled={actionDisabled || (full && actionLabel === "Join")}
        flexShrink="0"
        px="18px"
        py="8px"
      >
        {full && actionLabel === "Join" ? "Full" : actionLabel}
      </PillButton>
    </Flex>
  );
}

export default ChatRoomRow;
