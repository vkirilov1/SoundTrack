import type { ReactNode } from "react";
import { Box, chakra } from "@chakra-ui/react";

interface ChatToolbarButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  hoverBg?: string;
  badge?: boolean;
}

/** Icon-only trigger in ChatPanel's dark toolbar - members/invite/collapse/leave. */
function ChatToolbarButton({
  icon,
  label,
  onClick,
  active,
  hoverBg = "whiteAlpha.300",
  badge,
}: ChatToolbarButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      aria-label={label}
      position="relative"
      display="inline-flex"
      p="6px"
      bg={active ? "whiteAlpha.300" : "none"}
      border="none"
      borderRadius="md"
      color="white"
      cursor="pointer"
      _hover={{ bg: hoverBg }}
    >
      {icon}
      {badge && (
        <Box
          position="absolute"
          top="0"
          right="0"
          boxSize="8px"
          bg="danger"
          borderRadius="full"
        />
      )}
    </chakra.button>
  );
}

export default ChatToolbarButton;
