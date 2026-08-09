import { Icon } from "@chakra-ui/react";

interface BellIconProps {
  size?: number;
}

function BellIcon({ size = 20 }: BellIconProps) {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      boxSize={`${size}px`}
      fill="currentColor"
    >
      <path d="M12 2a1 1 0 0 0-1 1v1.06C7.61 4.51 5 7.44 5 11v4l-1.71 2.28A1 1 0 0 0 4 19h16a1 1 0 0 0 .8-1.6L19 15v-4c0-3.56-2.61-6.49-6-6.94V3a1 1 0 0 0-1-1zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z" />
    </Icon>
  );
}

export default BellIcon;
