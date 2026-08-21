import { Icon } from "@chakra-ui/react";

interface ChevronUpIconProps {
  size?: number;
}

function ChevronUpIcon({ size = 16 }: ChevronUpIconProps) {
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
      <path d="M18 15l-6-6-6 6" />
    </Icon>
  );
}

export default ChevronUpIcon;
