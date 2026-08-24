import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

interface PillButtonProps extends HTMLChakraProps<"button"> {
  /** Low-emphasis state for an already-completed action (e.g. "Invited", "Requested"). */
  muted?: boolean;
}

function PillButton({ muted, disabled, ...rest }: PillButtonProps) {
  return (
    <chakra.button
      type="button"
      disabled={disabled}
      fontSize="13px"
      fontWeight="600"
      px="16px"
      py="7px"
      bg={muted ? "none" : "accent"}
      border="none"
      borderRadius="full"
      color={muted ? "text" : "white"}
      cursor="pointer"
      _hover={muted ? undefined : { bg: "accentHover" }}
      _disabled={{ opacity: 0.5, cursor: "default" }}
      {...rest}
    />
  );
}

export default PillButton;
