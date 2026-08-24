import { useState } from "react";
import { Box, Flex, IconButton, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Avatar from "../../../components/Avatar/Avatar";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import CheckIcon from "../../../components/icons/CheckIcon";
import CrownIcon from "../../../components/icons/CrownIcon";
import XIcon from "../../../components/icons/XIcon";
import { userPhotoUrl } from "../../../utils/images";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import type { ChatRoomInfo } from "../types";
import ChatSectionHeader from "./ChatSectionHeader";

function MembersSection({
  room,
  onBack,
}: {
  room: ChatRoomInfo;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { kick, approve, decline } = useChat();
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === room.creator.id;

  function run(action: Promise<void>) {
    setError(null);
    return action.catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      throw e;
    });
  }

  return (
    <Box flex="1" overflowY="auto">
      <ChatSectionHeader
        title={`Members (${room.memberCount}/${room.maxCapacity})`}
        onBack={onBack}
      />

      {error && (
        <Text m="0" px="14px" py="6px" fontSize="12px" color="danger">
          {error}
        </Text>
      )}

      {room.members.map((member) => (
        <Flex key={member.id} align="center" gap="10px" px="14px" py="8px">
          <Link asChild flexShrink="0">
            <RouterLink to={`/profile/${member.id}`}>
              <Avatar
                src={userPhotoUrl(member.profilePicture ?? "userDefault.png")}
                alt={member.username}
                size="30px"
              />
            </RouterLink>
          </Link>
          <Link
            asChild
            flex="1"
            minW="0"
            fontSize="13px"
            fontWeight="600"
            color="ink"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to={`/profile/${member.id}`}>
              {member.username}
              {member.id === user?.id ? " (you)" : ""}
            </RouterLink>
          </Link>
          {member.id === room.creator.id && (
            <Box color="accent" title="Room owner">
              <CrownIcon size={14} />
            </Box>
          )}
          {isOwner && member.id !== room.creator.id && (
            <ConfirmDeleteControl
              label="Remove"
              confirmMessage={`Remove ${member.username}?`}
              onDelete={() => run(kick(member.id))}
            />
          )}
        </Flex>
      ))}

      {isOwner && room.pendingRequests.length > 0 && (
        <>
          <Text
            m="0"
            px="14px"
            pt="12px"
            pb="4px"
            fontSize="12px"
            fontWeight="700"
            color="text"
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            Join requests
          </Text>
          {room.pendingRequests.map((requester) => (
            <Flex
              key={requester.id}
              align="center"
              gap="10px"
              px="14px"
              py="8px"
              bg="border"
            >
              <Avatar
                src={userPhotoUrl(
                  requester.profilePicture ?? "userDefault.png",
                )}
                alt={requester.username}
                size="30px"
              />
              <Text
                m="0"
                flex="1"
                minW="0"
                fontSize="13px"
                fontWeight="600"
                color="ink"
                truncate
              >
                {requester.username}
              </Text>
              <IconButton
                onClick={() => void run(approve(requester.id)).catch(() => {})}
                aria-label={`Approve ${requester.username}`}
                title="Approve"
                w="28px"
                h="28px"
                minW="28px"
                borderRadius="full"
                bg="accent"
                color="white"
                _hover={{ bg: "accentHover" }}
              >
                <CheckIcon size={13} />
              </IconButton>
              <IconButton
                onClick={() => void run(decline(requester.id)).catch(() => {})}
                aria-label={`Decline ${requester.username}`}
                title="Decline"
                w="28px"
                h="28px"
                minW="28px"
                borderRadius="full"
                bg="border"
                color="text"
                _hover={{ color: "danger" }}
              >
                <XIcon size={13} />
              </IconButton>
            </Flex>
          ))}
        </>
      )}
    </Box>
  );
}

export default MembersSection;
