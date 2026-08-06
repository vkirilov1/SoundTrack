import { Button, type ButtonProps } from "@chakra-ui/react";

/**
 * Generic Button used for Save, Post, Upload, Sign Up, Log In, etc..
 * Centralizes common design. Size and spacing stay per call site since those differ by context.
 */
function PrimaryButton(props: ButtonProps) {
  return (
    <Button
      bg="accent"
      color="white"
      fontWeight="700"
      textTransform="uppercase"
      letterSpacing="0.4px"
      borderRadius="md"
      _hover={{ bg: "accentHover" }}
      _disabled={{ opacity: 0.7, cursor: "default" }}
      {...props}
    />
  );
}

export default PrimaryButton;
