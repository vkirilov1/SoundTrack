import { useState } from "react";
import { Box, Image, Link, Text, VStack, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Avatar from "../../../components/Avatar/Avatar";
import BellIcon from "../../../components/icons/BellIcon";
import PillButton from "../../../components/buttons/PillButton";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import { userPhotoUrl } from "../../../utils/images";
import { MONTH_DAY_FORMAT } from "../../../utils/date";
import { useChat } from "../../chat/stores/useChat";
import { CHAT_NOTIFICATION_TYPES } from "../types";
import type { AppNotification } from "../types";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClear: () => void;
}

function ActorLink({ notification }: { notification: AppNotification }) {
  return (
    <Link
      asChild
      fontWeight="600"
      color="ink"
      textDecoration="none"
      _hover={{ color: "accentHover" }}
    >
      <RouterLink to={`/profile/${notification.actor.id}`}>
        {notification.actor.username}
      </RouterLink>
    </Link>
  );
}

function NotificationMessage({
  notification,
}: {
  notification: AppNotification;
}) {
  switch (notification.type) {
    case "CHAT_INVITE":
      return (
        <>
          <ActorLink notification={notification} /> invited you to the chat room
          “{notification.context}”
        </>
      );
    case "CHAT_REQUEST_APPROVED":
      return (
        <>
          <ActorLink notification={notification} /> approved your request to
          join “{notification.context}”
        </>
      );
    case "CHAT_ACCESS_REVOKED":
      return <>Your access to chat rooms has been revoked by an Admin</>;
    case "CHAT_ACCESS_RESTORED":
      return <>Your access to chat rooms has been restored by an Admin</>;
    case "ALBUM_SUGGESTION_APPROVED":
      return (
        <>Your suggestion “{notification.context}” was approved by an Admin</>
      );
    case "ALBUM_SUGGESTION_REJECTED":
      return (
        <>Your suggestion “{notification.context}” was rejected by an Admin</>
      );
    case "FOLLOW":
      return (
        <>
          <ActorLink notification={notification} /> started following you
        </>
      );
    case "REVIEW_DELETED":
      return (
        <>
          Your review for{" "}
          {notification.entityId ? (
            <Link
              asChild
              fontWeight="600"
              color="ink"
              textDecoration="none"
              _hover={{ color: "accentHover" }}
            >
              <RouterLink to={`/album/${notification.entityId}`}>
                {notification.context}
              </RouterLink>
            </Link>
          ) : (
            notification.context
          )}{" "}
          has been deleted by an Admin
        </>
      );
    case "PHOTO_RESET":
      return <>Your profile picture has been reset by an Admin</>;
    default:
      return <>New notification</>;
  }
}

function NotificationPanel({ notifications, onClear }: NotificationPanelProps) {
  const { joinRoom } = useChat();
  const [chatErrors, setChatErrors] = useState<Record<number, string>>({});
  const [conflictNotification, setConflictNotification] =
    useState<AppNotification | null>(null);

  async function attemptJoin(
    notification: AppNotification,
    leaveCurrent = false,
  ) {
    if (notification.entityId == null) return;

    setChatErrors((prev) => ({ ...prev, [notification.id]: "" }));

    const outcome = await joinRoom(notification.entityId, leaveCurrent);

    if (outcome === "conflict") {
      setConflictNotification(notification);
      return;
    }

    const errors: Partial<Record<typeof outcome, string>> = {
      gone: "Room no longer exists.",
      full: "This room is full.",
      error: "Something went wrong. Try again.",
    };

    const message = errors[outcome];
    if (message) {
      setChatErrors((prev) => ({ ...prev, [notification.id]: message }));
    }
  }

  return (
    <Box
      position="absolute"
      top="calc(100% + 10px)"
      right="0"
      zIndex="10"
      w="320px"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.12)"
      overflow="hidden"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="14px"
        py="12px"
        borderBottom="1px solid"
        borderColor="border"
      >
        <Text as="span" m="0" fontSize="14px" fontWeight="600" color="ink">
          Notifications
        </Text>
        <chakra.button
          type="button"
          onClick={onClear}
          disabled={notifications.length === 0}
          fontSize="12px"
          fontWeight="600"
          color="accent"
          bg="none"
          border="none"
          cursor="pointer"
          _hover={{ color: "accentHover" }}
          _disabled={{ opacity: 0.5, cursor: "default" }}
        >
          Clear notifications
        </chakra.button>
      </Box>

      {notifications.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="8px"
          py="28px"
          px="16px"
        >
          <Image
            src={missingResourcesIcon}
            alt=""
            boxSize="36px"
            opacity="0.55"
          />
          <Text m="0" fontSize="13px" color="text" textAlign="center">
            No notifications yet.
          </Text>
        </Box>
      ) : (
        <VStack
          as="ul"
          listStyle="none"
          m="0"
          p="0"
          gap="0"
          align="stretch"
          maxH="360px"
          overflowY="auto"
        >
          {notifications.map((notification) => (
            <Box
              as="li"
              key={notification.id}
              display="flex"
              alignItems="center"
              gap="10px"
              px="14px"
              py="10px"
              bg={notification.read ? undefined : "highlightBg"}
              borderBottom="1px solid"
              borderColor="border"
              _last={{ borderBottom: "none" }}
            >
              {notification.type === "FOLLOW" ||
              CHAT_NOTIFICATION_TYPES.has(notification.type) ? (
                <Link asChild flexShrink="0">
                  <RouterLink to={`/profile/${notification.actor.id}`}>
                    <Avatar
                      src={userPhotoUrl(
                        notification.actor.profilePictureUrl ??
                          "userDefault.png",
                      )}
                      alt={notification.actor.username}
                      size="34px"
                    />
                  </RouterLink>
                </Link>
              ) : (
                <Box
                  flexShrink="0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="34px"
                  borderRadius="full"
                  bg="border"
                  color="text"
                >
                  <BellIcon size={16} />
                </Box>
              )}
              <Box flex="1" minW="0">
                <Text
                  as="span"
                  m="0"
                  fontSize="13px"
                  color="ink"
                  lineHeight="1.4"
                >
                  <NotificationMessage notification={notification} />
                </Text>
                <Text
                  as="span"
                  display="block"
                  fontSize="11px"
                  color="text"
                  opacity="0.7"
                >
                  {MONTH_DAY_FORMAT.format(new Date(notification.createdAt))}
                </Text>
                {chatErrors[notification.id] && (
                  <Text
                    as="span"
                    display="block"
                    fontSize="11px"
                    color="danger"
                  >
                    {chatErrors[notification.id]}
                  </Text>
                )}
              </Box>
              {notification.type === "CHAT_INVITE" &&
                notification.entityId != null &&
                !chatErrors[notification.id] && (
                  <PillButton
                    onClick={() => void attemptJoin(notification)}
                    flexShrink="0"
                    fontSize="12px"
                    px="12px"
                    py="5px"
                  >
                    Join
                  </PillButton>
                )}
            </Box>
          ))}
        </VStack>
      )}

      {conflictNotification && (
        <ConfirmActionModal
          title="Switch Chat Room"
          message="You are already in a chat room. Leave it and join this one?"
          confirmLabel="Leave & join"
          confirmingLabel="Switching…"
          onConfirm={() => attemptJoin(conflictNotification, true)}
          onClose={() => setConflictNotification(null)}
        />
      )}
    </Box>
  );
}

export default NotificationPanel;
