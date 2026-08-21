import { useState } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import Avatar from "../../../components/Avatar/Avatar";
import PillButton from "../../../components/buttons/PillButton";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
} from "../../search/hooks/useDebouncedSearch";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import type { ChatRoomInfo } from "../types";
import ChatSectionHeader from "./ChatSectionHeader";

/** Search users by name and send chat invites (delivered as notifications). */
function InviteSection({
  room,
  onBack,
}: {
  room: ChatRoomInfo;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { invite } = useChat();

  const [query, setQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const { userResults, loading } = useDebouncedSearch(query, "users");
  const searching = query.trim().length >= MIN_QUERY_LENGTH;

  function handleInvite(target: UserProfile) {
    setError(null);
    invite(target.id)
      .then(() => {
        setInvitedIds((prev) => new Set(prev).add(target.id));
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to send invite."),
      );
  }

  const memberIds = new Set(room.members.map((m) => m.id));

  return (
    <Box flex="1" overflowY="auto">
      <ChatSectionHeader title="Invite to chat" onBack={onBack} />

      <Box px="12px" py="10px">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users"
          size="sm"
          fontSize="13px"
          borderColor="border"
          borderRadius="full"
          _focus={{ borderColor: "accent" }}
          _focusVisible={{ outline: "none", boxShadow: "none" }}
        />
      </Box>

      {error && (
        <Text m="0" px="14px" pb="6px" fontSize="12px" color="danger">
          {error}
        </Text>
      )}

      {searching && loading && (
        <Text m="0" px="14px" py="8px" fontSize="12px" color="text">
          Searching…
        </Text>
      )}

      {searching &&
        !loading &&
        userResults
          .filter((result) => result.id !== user?.id)
          .map((result) => {
            const alreadyMember = memberIds.has(result.id);
            const invited = invitedIds.has(result.id);
            return (
              <Flex
                key={result.id}
                align="center"
                gap="10px"
                px="14px"
                py="8px"
              >
                <Avatar
                  src={userPhotoUrl(
                    result.profilePictureUrl ?? "userDefault.png",
                  )}
                  alt={result.username}
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
                  {result.username}
                </Text>
                {alreadyMember ? (
                  <Text m="0" fontSize="12px" color="text">
                    In chat
                  </Text>
                ) : (
                  <PillButton
                    onClick={() => handleInvite(result)}
                    disabled={invited}
                    muted={invited}
                    fontSize="12px"
                    px="12px"
                    py="5px"
                  >
                    {invited ? "Invited" : "Invite"}
                  </PillButton>
                )}
              </Flex>
            );
          })}

      {searching && !loading && userResults.length === 0 && (
        <Text m="0" px="14px" py="8px" fontSize="12px" color="text">
          No users found.
        </Text>
      )}
    </Box>
  );
}

export default InviteSection;
