import { useCallback, useState } from "react";
import { Box, Input, Text } from "@chakra-ui/react";
import Pagination from "../../../components/Pagination/Pagination";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
} from "../../search/hooks/useDebouncedSearch";
import { getFollowing } from "../../profile/api/followApi";
import { usePagedList } from "../../../hooks/usePagedList";
import type { UserProfile } from "../../../types/auth";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import type { ChatRoomInfo } from "../types";
import ChatSectionHeader from "./ChatSectionHeader";
import InviteUserRow from "./InviteUserRow";

const FOLLOWING_PAGE_SIZE = 10;

/**
 * Search users by name and send chat invites (delivered as notifications). With no query typed,
 * defaults to the caller's own paginated "following" list
 */
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

  const fetchFollowing = useCallback(
    (page: number) =>
      user
        ? getFollowing(user.id, page, FOLLOWING_PAGE_SIZE)
        : Promise.resolve({
            content: [],
            page: 0,
            size: FOLLOWING_PAGE_SIZE,
            totalElements: 0,
            totalPages: 0,
          }),
    [user],
  );
  const {
    items: following,
    page,
    totalPages,
    loading: followingLoading,
    goToPage,
  } = usePagedList(fetchFollowing, { enabled: !searching });

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

      {searching ? (
        <>
          {loading && (
            <Text m="0" px="14px" py="8px" fontSize="12px" color="text">
              Searching…
            </Text>
          )}

          {!loading &&
            userResults
              .filter((result) => result.id !== user?.id)
              .map((result) => (
                <InviteUserRow
                  key={result.id}
                  user={result}
                  alreadyMember={memberIds.has(result.id)}
                  invited={invitedIds.has(result.id)}
                  onInvite={handleInvite}
                />
              ))}

          {!loading && userResults.length === 0 && (
            <Text m="0" px="14px" py="8px" fontSize="12px" color="text">
              No users found.
            </Text>
          )}
        </>
      ) : (
        <>
          {!followingLoading && following.length === 0 && (
            <Text m="0" px="14px" py="8px" fontSize="12px" color="text">
              You're not following anyone yet.
            </Text>
          )}

          {following.map((result) => (
            <InviteUserRow
              key={result.id}
              user={result}
              alreadyMember={memberIds.has(result.id)}
              invited={invitedIds.has(result.id)}
              onInvite={handleInvite}
            />
          ))}

          <Box px="8px">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default InviteSection;
