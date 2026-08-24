import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

function SecondaryButton({ disabled, ...rest }: HTMLChakraProps<"button">) {
  return (
    <chakra.button
      type="button"
      disabled={disabled}
      bg="none"
      color="text"
      fontSize="13px"
      fontWeight="600"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      px="18px"
      py="6px"
      cursor="pointer"
      transition="background 0.15s ease, color 0.15s ease"
      _hover={disabled ? undefined : { bg: "border", color: "ink" }}
      _disabled={{ opacity: 0.7, cursor: "default" }}
      {...rest}
    />
  );
}

export default SecondaryButton;
