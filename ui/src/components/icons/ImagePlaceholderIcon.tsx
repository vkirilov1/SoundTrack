import { Icon } from "@chakra-ui/react";

interface ImagePlaceholderIconProps {
  size?: number;
}

function ImagePlaceholderIcon({ size = 24 }: ImagePlaceholderIconProps) {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      boxSize={`${size}px`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </Icon>
  );
}

export default ImagePlaceholderIcon;
