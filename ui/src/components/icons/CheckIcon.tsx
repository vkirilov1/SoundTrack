import { Icon } from "@chakra-ui/react";

interface CheckIconProps {
  size?: number;
}

function CheckIcon({ size = 16 }: CheckIconProps) {
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
      <path d="M5 13l4 4L19 7" />
    </Icon>
  );
}

export default CheckIcon;
