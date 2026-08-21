import { Icon } from "@chakra-ui/react";

interface CrownIconProps {
  size?: number;
}

function CrownIcon({ size = 16 }: CrownIconProps) {
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
      <path d="M2 6l4 4 6-6 6 6 4-4-2 12H4L2 6z" />
      <path d="M4 21h16" />
    </Icon>
  );
}

export default CrownIcon;
