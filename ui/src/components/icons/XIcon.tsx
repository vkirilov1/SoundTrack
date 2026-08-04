import { Icon } from "@chakra-ui/react";

interface XIconProps {
  size?: number;
}

function XIcon({ size = 16 }: XIconProps) {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      boxSize={`${size}px`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export default XIcon;
