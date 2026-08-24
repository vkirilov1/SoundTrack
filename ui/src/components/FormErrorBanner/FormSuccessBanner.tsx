import { Text } from "@chakra-ui/react";

interface FormSuccessBannerProps {
  children: string;
}

function FormSuccessBanner({ children }: FormSuccessBannerProps) {
  return (
    <Text
      bg="accentBg"
      color="accentHover"
      fontSize="13px"
      px="14px"
      py="10px"
      borderRadius="md"
      m="0"
    >
      {children}
    </Text>
  );
}

export default FormSuccessBanner;
