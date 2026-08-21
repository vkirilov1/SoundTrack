import { Icon } from "@chakra-ui/react";

interface FlagIconProps {
  size?: number;
}

function FlagIcon({ size = 16 }: FlagIconProps) {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      boxSize={`${size}px`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 3v18" />
      <path d="M4 4h13l-2.5 4L20 12H4" />
    </Icon>
  );
}

export default FlagIcon;
