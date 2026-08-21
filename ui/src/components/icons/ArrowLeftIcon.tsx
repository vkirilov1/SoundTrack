import { Icon } from "@chakra-ui/react";

interface ArrowLeftIconProps {
  size?: number;
}

function ArrowLeftIcon({ size = 16 }: ArrowLeftIconProps) {
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
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
  );
}

export default ArrowLeftIcon;
