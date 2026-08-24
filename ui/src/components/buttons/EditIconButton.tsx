import { chakra } from "@chakra-ui/react";
import EditIcon from "../icons/EditIcon";

interface EditIconButtonProps {
  onClick: () => void;
  label: string;
  size?: number;
}

function EditIconButton({ onClick, label, size = 15 }: EditIconButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="22px"
      flexShrink="0"
      bg="none"
      border="none"
      borderRadius="full"
      color="text"
      cursor="pointer"
      transition="color 0.15s ease, background-color 0.15s ease"
      _hover={{ color: "ink", bg: "border" }}
    >
      <EditIcon size={size} />
    </chakra.button>
  );
}

export default EditIconButton;
