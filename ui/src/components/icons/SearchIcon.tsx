import { Icon } from "@chakra-ui/react";

interface SearchIconProps {
  size?: number;
}

function SearchIcon({ size = 16 }: SearchIconProps) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </Icon>
  );
}

export default SearchIcon;
