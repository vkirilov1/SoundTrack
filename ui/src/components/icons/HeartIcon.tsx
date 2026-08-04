import { Icon } from "@chakra-ui/react";

const HEART_PATH =
  "m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z";

interface HeartIconProps {
  filled: boolean;
  size?: number;
}

function HeartIcon({ filled, size = 20 }: HeartIconProps) {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      boxSize={`${size}px`}
      aria-hidden="true"
      fill={filled ? "var(--chakra-colors-favorite)" : "none"}
      stroke={filled ? "var(--chakra-colors-favorite)" : "currentColor"}
      strokeWidth={1.5}
    >
      <g transform="translate(0 -1028.4)">
        <path d={HEART_PATH} />
      </g>
    </Icon>
  );
}

export default HeartIcon;
