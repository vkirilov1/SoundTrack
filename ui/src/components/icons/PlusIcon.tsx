import { Icon } from "@chakra-ui/react";

interface PlusIconProps {
  size?: number;
}

function PlusIcon({ size = 16 }: PlusIconProps) {
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
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export default PlusIcon;
