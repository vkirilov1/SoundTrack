import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Link,
  Text,
  chakra,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import PageContainer from "../../../components/PageContainer/PageContainer";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import PlusIcon from "../../../components/icons/PlusIcon";
import RefreshIcon from "../../../components/icons/RefreshIcon";
import SearchIcon from "../../../components/icons/SearchIcon";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import * as chatApi from "../api/chatApi";
import type { ChatRoomInfo } from "../types";
import ChatRoomRow from "./ChatRoomRow";
import CreateRoomModal from "./CreateRoomModal";

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
      <PageContainer>
        <Box textAlign="center" py="80px">
          <Text m="0" fontSize="22px" fontWeight="700" color="ink">
            Chats are for members only
          </Text>
          <Text m="0" mt="8px" fontSize="14px" color="text">
            Sign in to browse and join live chat rooms about your favorite
            albums and artists.
          </Text>
          <Link
            asChild
            display="inline-block"
            mt="20px"
            bg="accent"
            color="white"
            fontSize="14px"
            fontWeight="600"
            px="24px"
            py="10px"
            borderRadius="full"
            textDecoration="none"
            _hover={{ bg: "accentHover", color: "white" }}
          >
            <RouterLink to="/login">Sign In</RouterLink>
          </Link>
        </Box>
      </PageContainer>
    );
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filteredRooms = trimmedQuery
    ? rooms.filter((room) => room.name.toLowerCase().includes(trimmedQuery))
    : rooms;

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
              top="50%"
              transform="translateY(-50%)"
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

      <Box h="2px" bg="border" mb="8px" />

      {loaded && rooms.length === 0 && (
        <Text m="0" py="48px" fontSize="14px" color="text" textAlign="center">
          No active chat rooms right now - start one with the + button.
        </Text>
      )}

      {loaded && rooms.length > 0 && filteredRooms.length === 0 && (
        <Text m="0" py="48px" fontSize="14px" color="text" textAlign="center">
          No chat rooms match &ldquo;{query.trim()}&rdquo;.
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
