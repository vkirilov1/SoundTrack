import { Box, chakra } from "@chakra-ui/react";
import BellIcon from "../icons/BellIcon";
import { useNotificationBell } from "./useNotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../../features/notifications/hooks/useNotifications";

function NotificationBell() {
  const { open, panelRef, toggle } = useNotificationBell();
  const { unreadCount, notifications, loadNotifications, clearAll } =
    useNotifications();

  function handleToggle() {
    const opening = !open;
    toggle();
    if (opening) {
      loadNotifications().catch(() => {});
    }
  }

  return (
    <Box position="relative" ref={panelRef}>
      <chakra.button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        position="relative"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="36px"
        bg="none"
        border="none"
        borderRadius="full"
        color="white"
        cursor="pointer"
        transition="background-color 0.15s ease"
        _hover={{ bg: "rgba(255, 255, 255, 0.12)" }}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <Box
            position="absolute"
            top="2px"
            right="2px"
            minW="16px"
            h="16px"
            px="3px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="danger"
            color="white"
            fontSize="10px"
            fontWeight="700"
            borderRadius="full"
            lineHeight="1"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Box>
        )}
      </chakra.button>

      {open && (
        <NotificationPanel notifications={notifications} onClear={clearAll} />
      )}
    </Box>
  );
}

export default NotificationBell;
