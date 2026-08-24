import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

function UnderlineTextButton({ disabled, ...rest }: HTMLChakraProps<"button">) {
  return (
    <chakra.button
      type="button"
      disabled={disabled}
      bg="none"
      border="none"
      p="0"
      font="inherit"
      fontSize="14px"
      color="ink"
      textDecoration="underline"
      cursor="pointer"
      _hover={disabled ? undefined : { color: "linkHover" }}
      _disabled={{ opacity: 0.6, cursor: "default" }}
      {...rest}
    />
  );
}

export default UnderlineTextButton;
