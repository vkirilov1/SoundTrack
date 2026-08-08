import { chakra } from "@chakra-ui/react";
import PlusIcon from "../icons/PlusIcon";

interface AddChipButtonProps {
  onClick: () => void;
  label: string;
  size?: number;
}

/** Small circular "+" trigger for opening a search-and-add menu */
function AddChipButton({ onClick, label, size = 26 }: AddChipButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize={`${size}px`}
      flexShrink="0"
      bg="border"
      border="none"
      borderRadius="full"
      color="text"
      cursor="pointer"
      transition="background-color 0.15s ease, color 0.15s ease"
      _hover={{ bg: "accent", color: "white" }}
    >
      <PlusIcon size={Math.round(size * 0.5)} />
    </chakra.button>
  );
}

export default AddChipButton;
