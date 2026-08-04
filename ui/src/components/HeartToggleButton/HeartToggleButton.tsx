import { chakra } from "@chakra-ui/react";
import HeartIcon from "../icons/HeartIcon";

interface HeartToggleButtonProps {
  filled: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

function HeartToggleButton({
  filled,
  onClick,
  disabled,
  size = 18,
}: HeartToggleButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={filled}
      aria-label={filled ? "Remove from favorites" : "Add to favorites"}
      flexShrink="0"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="30px"
      h="30px"
      bg="none"
      border="none"
      borderRadius="full"
      color="text"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={disabled ? undefined : { bg: "border" }}
      _disabled={{ opacity: 0.6, cursor: "default" }}
    >
      <HeartIcon filled={filled} size={size} />
    </chakra.button>
  );
}

export default HeartToggleButton;
