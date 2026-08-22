import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, Input, Text, chakra } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import FilterIcon from "../../../components/icons/FilterIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import RefreshIcon from "../../../components/icons/RefreshIcon";
import SearchIcon from "../../../components/icons/SearchIcon";
import XIcon from "../../../components/icons/XIcon";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import * as chatApi from "../api/chatApi";
import type { ChatRoomInfo } from "../types";
import type { SearchResult } from "../../search/types";
import SearchFilterMenu from "../../search/components/SearchFilterMenu";
import type { UserProfile } from "../../../types/auth";
import ChatRoomRow from "./ChatRoomRow";
import CreateRoomModal from "./CreateRoomModal";
import MembersOnlyMessage from "../../../components/MembersOnlyMessage/MembersOnlyMessage";

function actionLabelFor(room: ChatRoomInfo): string {
  switch (room.myStatus) {
    case "OWNER":
    case "MEMBER":
      return "Open";
    case "PENDING":
      return "Requested";
    default:
      return "Join";
  }
}

function ChatsPage() {
  const { user, isLoading } = useAuth();
  const { phase, joinRoom } = useChat();

  const [rooms, setRooms] = useState<ChatRoomInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [conflictRoom, setConflictRoom] = useState<ChatRoomInfo | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const [topicFilter, setTopicFilter] = useState<SearchResult | null>(null);
  const [userFilter, setUserFilter] = useState<UserProfile | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filterMenuOpen]);

  const refresh = useCallback(() => {
    if (!user) return;
    chatApi
      .getRooms()
      .then((data) => {
        setRooms(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh, phase]);

  async function attemptJoin(room: ChatRoomInfo, leaveCurrent = false) {
    setRowErrors((prev) => ({ ...prev, [room.id]: "" }));

    const outcome = await joinRoom(room.id, leaveCurrent);

    if (outcome === "conflict") {
      setConflictRoom(room);
      return;
    }

    if (outcome === "gone") {
      setRowErrors((prev) => ({
        ...prev,
        [room.id]: "This room no longer exists.",
      }));
    } else if (outcome === "full") {
      setRowErrors((prev) => ({ ...prev, [room.id]: "This room is full." }));
    } else if (outcome === "forbidden") {
      setRowErrors((prev) => ({
        ...prev,
        [room.id]: "Your access to chat rooms has been revoked.",
      }));
    } else if (outcome === "error") {
      setRowErrors((prev) => ({
        ...prev,
        [room.id]: "Something went wrong. Try again.",
      }));
    }

    refresh();
  }

  if (!isLoading && !user) {
    return (
      <MembersOnlyMessage
        header={"Chats are for members only"}
        content={
          "Sign in to browse and join live chat rooms about your favorite albums and artists."
        }
      />
    );
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filteredRooms = rooms
    .filter((room) =>
      trimmedQuery ? room.name.toLowerCase().includes(trimmedQuery) : true,
    )
    .filter((room) =>
      topicFilter
        ? room.topicType === topicFilter.type && room.topicId === topicFilter.id
        : true,
    )
    .filter((room) =>
      userFilter
        ? room.members.some((member) => member.id === userFilter.id)
        : true,
    );

  const hasActiveFilters = topicFilter !== null || userFilter !== null;
  const noMatches =
    loaded &&
    rooms.length > 0 &&
    filteredRooms.length === 0 &&
    (trimmedQuery.length > 0 || hasActiveFilters);

  return (
    <PageContainer>
      <Flex
        align="center"
        justify="space-between"
        gap="12px"
        mb="8px"
        wrap="wrap"
      >
        <Heading as="h1" fontSize="28px" m="0">
          Active <chakra.span color="accent">Chat Rooms</chakra.span>
        </Heading>

        <Flex align="center" gap="10px">
          <Box position="relative">
            <Box
              position="absolute"
              left="12px"
              top="0"
              bottom="0"
              display="flex"
              alignItems="center"
              color="text"
              pointerEvents="none"
            >
              <SearchIcon size={14} />
            </Box>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chat rooms"
              size="sm"
              w="220px"
              pl="32px"
              borderColor="border"
              _focus={{ borderColor: "accent" }}
              _focusVisible={{ outline: "none", boxShadow: "none" }}
            />
          </Box>

          <Box position="relative" ref={filterMenuRef}>
            <chakra.button
              type="button"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
              aria-label="Filter chat rooms"
              aria-expanded={filterMenuOpen}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="36px"
              bg="none"
              border="none"
              borderRadius="full"
              color={hasActiveFilters ? "accent" : "ink"}
              cursor="pointer"
              _hover={{ bg: "border" }}
            >
              <FilterIcon size={17} />
            </chakra.button>

            {filterMenuOpen && (
              <SearchFilterMenu
                onSelectMusic={(result) => {
                  setTopicFilter(result);
                  setFilterMenuOpen(false);
                }}
                onSelectUser={(selectedUser) => {
                  setUserFilter(selectedUser);
                  setFilterMenuOpen(false);
                }}
              />
            )}
          </Box>

          <chakra.button
            type="button"
            onClick={refresh}
            aria-label="Refresh chat rooms"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="36px"
            bg="none"
            border="none"
            borderRadius="full"
            color="ink"
            cursor="pointer"
            _hover={{ bg: "border" }}
          >
            <RefreshIcon size={17} />
          </chakra.button>

          <chakra.button
            type="button"
            onClick={() => setCreating(true)}
            aria-label="Create a chat room"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="36px"
            bg="none"
            border="none"
            borderRadius="full"
            color="ink"
            cursor="pointer"
            _hover={{ bg: "border" }}
          >
            <PlusIcon size={20} />
          </chakra.button>
        </Flex>
      </Flex>

      {hasActiveFilters && (
        <Flex gap="8px" mb="8px" wrap="wrap">
          {topicFilter && (
            <chakra.span
              display="inline-flex"
              alignItems="center"
              gap="6px"
              px="10px"
              py="5px"
              fontSize="12px"
              fontWeight="600"
              color="ink"
              bg="accentBg"
              borderRadius="full"
            >
              Topic: {topicFilter.title}
              <chakra.button
                type="button"
                onClick={() => setTopicFilter(null)}
                aria-label="Clear topic filter"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bg="none"
                border="none"
                color="inherit"
                cursor="pointer"
                p="0"
              >
                <XIcon size={10} />
              </chakra.button>
            </chakra.span>
          )}
          {userFilter && (
            <chakra.span
              display="inline-flex"
              alignItems="center"
              gap="6px"
              px="10px"
              py="5px"
              fontSize="12px"
              fontWeight="600"
              color="ink"
              bg="accentBg"
              borderRadius="full"
            >
              Member: {userFilter.username}
              <chakra.button
                type="button"
                onClick={() => setUserFilter(null)}
                aria-label="Clear member filter"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bg="none"
                border="none"
                color="inherit"
                cursor="pointer"
                p="0"
              >
                <XIcon size={10} />
              </chakra.button>
            </chakra.span>
          )}
        </Flex>
      )}

      <Box h="2px" bg="border" mb="8px" />

      {loaded && rooms.length === 0 && (
        <Text m="0" py="48px" fontSize="14px" color="text" textAlign="center">
          No active chat rooms right now - start one with the + button.
        </Text>
      )}

      {noMatches && (
        <Text m="0" py="48px" fontSize="14px" color="text" textAlign="center">
          No chat rooms match your filters.
        </Text>
      )}

      {filteredRooms.length > 0 && (
        <chakra.ul listStyle="none" m="0" p="0">
          {filteredRooms.map((room) => (
            <ChatRoomRow
              key={room.id}
              room={room}
              actionLabel={actionLabelFor(room)}
              actionDisabled={room.myStatus === "PENDING"}
              onAction={() => void attemptJoin(room)}
              error={rowErrors[room.id] || null}
            />
          ))}
        </chakra.ul>
      )}

      {creating && <CreateRoomModal onClose={() => setCreating(false)} />}

      {conflictRoom && (
        <ConfirmActionModal
          title="Switch Chat Room"
          message="You are already in a chat room. Leave it and join this one?"
          confirmLabel="Leave & join"
          confirmingLabel="Switching…"
          onConfirm={() => attemptJoin(conflictRoom, true)}
          onClose={() => setConflictRoom(null)}
        />
      )}
    </PageContainer>
  );
}

export default ChatsPage;
