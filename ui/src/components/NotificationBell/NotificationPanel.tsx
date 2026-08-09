import { Box, Image, Link, Text, VStack, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import missingResourcesIcon from "../../assets/MissingResources.png";
import Avatar from "../Avatar/Avatar";
import BellIcon from "../icons/BellIcon";
import { userPhotoUrl } from "../../utils/images";
import { MONTH_DAY_FORMAT } from "../../utils/date";
import type { AppNotification } from "../../features/notifications/types";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClear: () => void;
}

/**
 * FOLLOW notifications name and link to the actor. REVIEW_DELETED/PHOTO_RESET are admin actions -
 * the acting admin's identity is intentionally never shown, so those render as plain system
 * messages instead of crediting `notification.actor`.
 */
function NotificationMessage({
  notification,
}: {
  notification: AppNotification;
}) {
  switch (notification.type) {
    case "FOLLOW":
      return (
        <>
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
          </Link>{" "}
          started following you
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
              {notification.type === "FOLLOW" ? (
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
              </Box>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default NotificationPanel;
