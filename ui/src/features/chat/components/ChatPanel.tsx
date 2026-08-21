import { useEffect, useRef, useState } from "react";
import { Box, Flex, Input, Text, chakra } from "@chakra-ui/react";
import Avatar from "../../../components/Avatar/Avatar";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import ChevronDownIcon from "../../../components/icons/ChevronDownIcon";
import FlagIcon from "../../../components/icons/FlagIcon";
import LogOutIcon from "../../../components/icons/LogOutIcon";
import SendIcon from "../../../components/icons/SendIcon";
import UserPlusIcon from "../../../components/icons/UserPlusIcon";
import UsersIcon from "../../../components/icons/UsersIcon";
import XIcon from "../../../components/icons/XIcon";
import { userPhotoUrl } from "../../../utils/images";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../stores/useChat";
import { deleteChatRoom } from "../moderation/api/chatModerationApi";
import { ApiError } from "../../../lib/api-error";
import type { ChatRoomInfo } from "../types";
import ChatToolbarButton from "./ChatToolbarButton";
import MembersSection from "./MembersSection";
import InviteSection from "./InviteSection";
import LeaveRoomModal from "./LeaveRoomModal";
import ReportRoomModal from "./ReportRoomModal";

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

type PanelView = "messages" | "members" | "invite";

const MAX_MESSAGE_LENGTH = 1000;
const SEND_WINDOW_MS = 8000;
const MAX_SENDS_IN_WINDOW = 6;
const THROTTLE_COOLDOWN_MS = 3000;

function ChatPanel({ room }: { room: ChatRoomInfo }) {
  const { user } = useAuth();
  const { messages, connected, setExpanded, leave, sendMessage } = useChat();

  const [view, setView] = useState<PanelView>("messages");
  const [draft, setDraft] = useState("");
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isOwner = user?.id === room.creator.id;
  const isAdmin = user?.role === "ADMIN";
  const pendingCount = room.pendingRequests.length;

  async function handleDeleteRoom() {
    setDeleteError(null);
    try {
      await deleteChatRoom(room.id);
    } catch (e: unknown) {
      setDeleteError(
        e instanceof ApiError ? e.message : "Couldn't delete this room.",
      );
      throw e;
    }
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, view]);

  const sendTimestampsRef = useRef<number[]>([]);
  const [throttled, setThrottled] = useState(false);

  function handleSend() {
    const content = draft.trim();
    if (!content || throttled) return;

    const now = Date.now();
    sendTimestampsRef.current = sendTimestampsRef.current.filter(
      (t) => now - t < SEND_WINDOW_MS,
    );
    sendTimestampsRef.current.push(now);

    if (sendTimestampsRef.current.length > MAX_SENDS_IN_WINDOW) {
      setThrottled(true);
      setTimeout(() => setThrottled(false), THROTTLE_COOLDOWN_MS);
      return;
    }

    sendMessage(content);
    setDraft("");
  }

  return (
    <Flex
      direction="column"
      h="520px"
      maxH="75vh"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderBottom="none"
      borderTopRadius="lg"
      boxShadow="0 -4px 24px rgba(0, 0, 0, 0.2)"
      overflow="hidden"
    >
      <Flex align="center" gap="8px" bg="inkBlack" px="14px" py="10px">
        <Box flex="1" minW="0">
          <Text m="0" fontSize="13px" fontWeight="700" color="white" truncate>
            {room.name}
          </Text>
          <Text m="0" fontSize="11px" color="whiteAlpha.700" truncate>
            {room.topicName ?? "Unknown topic"}
          </Text>
        </Box>

        <Flex align="center" gap="3px" color="whiteAlpha.800" fontSize="12px">
          <UsersIcon size={13} />
          {room.memberCount}/{room.maxCapacity}
        </Flex>

        <ChatToolbarButton
          icon={<UsersIcon size={15} />}
          label="Members"
          active={view === "members"}
          badge={isOwner && pendingCount > 0}
          onClick={() => setView(view === "members" ? "messages" : "members")}
        />

        <ChatToolbarButton
          icon={<UserPlusIcon size={15} />}
          label="Invite users"
          active={view === "invite"}
          onClick={() => setView(view === "invite" ? "messages" : "invite")}
        />

        <ChatToolbarButton
          icon={<ChevronDownIcon size={15} />}
          label="Collapse chat"
          onClick={() => setExpanded(false)}
        />

        {!isOwner && (
          <ChatToolbarButton
            icon={<FlagIcon size={15} />}
            label="Report room"
            onClick={() => setReporting(true)}
          />
        )}

        {isAdmin && (
          <ChatToolbarButton
            icon={<XIcon size={15} />}
            label="Delete room"
            hoverBg="danger"
            onClick={() => setConfirmingDelete(true)}
          />
        )}

        <ChatToolbarButton
          icon={<LogOutIcon size={15} />}
          label="Leave chat"
          hoverBg="danger"
          onClick={() => setConfirmingLeave(true)}
        />
      </Flex>

      {confirmingLeave && (
        <LeaveRoomModal
          roomName={room.name}
          isOwner={isOwner}
          onConfirm={leave}
          onClose={() => setConfirmingLeave(false)}
        />
      )}

      {reporting && (
        <ReportRoomModal roomId={room.id} onClose={() => setReporting(false)} />
      )}

      {confirmingDelete && (
        <ConfirmActionModal
          title="Delete Chat Room"
          message={
            deleteError ??
            `Delete "${room.name}"? This ends the chat for everyone and cannot be undone.`
          }
          confirmLabel="Delete room"
          confirmingLabel="Deleting…"
          tone="danger"
          onConfirm={handleDeleteRoom}
          onClose={() => setConfirmingDelete(false)}
        />
      )}

      {!connected && (
        <Box bg="border" px="14px" py="6px">
          <Text m="0" fontSize="11px" color="text">
            Reconnecting…
          </Text>
        </Box>
      )}

      {view === "members" && (
        <MembersSection room={room} onBack={() => setView("messages")} />
      )}
      {view === "invite" && (
        <InviteSection room={room} onBack={() => setView("messages")} />
      )}

      {view === "messages" && (
        <>
          <Box ref={scrollRef} flex="1" overflowY="auto" px="12px" py="10px">
            {messages.length === 0 && (
              <Text
                m="0"
                pt="24px"
                fontSize="12px"
                color="text"
                textAlign="center"
              >
                No messages yet - say hi!
              </Text>
            )}

            {messages.map((message) => {
              if (message.messageType !== "TEXT") {
                return (
                  <Text
                    key={message.id}
                    m="0"
                    py="6px"
                    fontSize="11px"
                    color="text"
                    textAlign="center"
                    fontStyle="italic"
                  >
                    {message.content}
                  </Text>
                );
              }

              const own = message.senderId === user?.id;
              return (
                <Flex
                  key={message.id}
                  gap="8px"
                  py="5px"
                  direction={own ? "row-reverse" : "row"}
                >
                  <Avatar
                    src={userPhotoUrl(
                      message.senderProfilePicture ?? "userDefault.png",
                    )}
                    alt={message.senderUsername}
                    size="28px"
                  />
                  <Box maxW="75%">
                    <Flex
                      gap="6px"
                      align="baseline"
                      direction={own ? "row-reverse" : "row"}
                    >
                      <Text m="0" fontSize="11px" fontWeight="600" color="ink">
                        {own ? "You" : message.senderUsername}
                      </Text>
                      <Text m="0" fontSize="10px" color="text" opacity="0.7">
                        {TIME_FORMAT.format(new Date(message.sentAt))}
                      </Text>
                    </Flex>
                    <Box
                      mt="2px"
                      px="10px"
                      py="6px"
                      bg={own ? "accent" : "border"}
                      color={own ? "white" : "ink"}
                      fontSize="13px"
                      borderRadius="12px"
                      borderTopLeftRadius={own ? "12px" : "4px"}
                      borderTopRightRadius={own ? "4px" : "12px"}
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {message.content}
                    </Box>
                  </Box>
                </Flex>
              );
            })}
          </Box>

          {throttled && (
            <Text m="0" px="14px" pb="4px" fontSize="11px" color="danger">
              Slow down a bit before sending more messages.
            </Text>
          )}

          <Flex
            gap="8px"
            px="10px"
            py="10px"
            borderTop="1px solid"
            borderColor="border"
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={throttled ? "Slow down a bit…" : "Type a message"}
              disabled={throttled}
              flex="1"
              minW="0"
              size="sm"
              fontSize="13px"
              borderColor="border"
              borderRadius="full"
              _focus={{ borderColor: "accent" }}
              _focusVisible={{ outline: "none", boxShadow: "none" }}
            />
            <chakra.button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || !connected || throttled}
              aria-label="Send message"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="36px"
              bg="accent"
              border="none"
              borderRadius="full"
              color="white"
              cursor="pointer"
              _hover={{ bg: "accentHover" }}
              _disabled={{ opacity: 0.5, cursor: "default" }}
            >
              <SendIcon size={15} />
            </chakra.button>
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ChatPanel;
