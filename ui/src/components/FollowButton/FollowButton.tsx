import { useState } from "react";
import { chakra } from "@chakra-ui/react";
import PlusIcon from "../icons/PlusIcon";
import CheckIcon from "../icons/CheckIcon";
import XIcon from "../icons/XIcon";

interface FollowButtonProps {
  followed: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

function FollowButton({
  followed,
  onClick,
  disabled,
  size = 32,
}: FollowButtonProps) {
  const [hovering, setHovering] = useState(false);

  const showUnfollow = followed && hovering;

  const bg = showUnfollow ? "danger" : followed ? "success" : "accent";
  const label = showUnfollow ? "Unfollow" : followed ? "Following" : "Follow";

  return (
    <chakra.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      disabled={disabled}
      aria-pressed={followed}
      aria-label={label}
      title={label}
      flexShrink="0"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize={`${size}px`}
      bg={bg}
      color="white"
      border="none"
      borderRadius="full"
      cursor="pointer"
      transition="background-color 0.15s ease"
      _disabled={{ opacity: 0.6, cursor: "default" }}
    >
      {showUnfollow ? (
        <XIcon size={Math.round(size * 0.45)} />
      ) : followed ? (
        <CheckIcon size={Math.round(size * 0.45)} />
      ) : (
        <PlusIcon size={Math.round(size * 0.5)} />
      )}
    </chakra.button>
  );
}

export default FollowButton;
