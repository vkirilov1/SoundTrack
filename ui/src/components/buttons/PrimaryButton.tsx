import { Button, type ButtonProps } from "@chakra-ui/react";

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
