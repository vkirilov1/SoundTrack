import { Icon } from "@chakra-ui/react";

interface ChevronDownIconProps {
  size?: number;
}

function ChevronDownIcon({ size = 16 }: ChevronDownIconProps) {
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
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export default ChevronDownIcon;
