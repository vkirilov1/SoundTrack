import { Text } from "@chakra-ui/react";

interface FormErrorBannerProps {
  children: string;
}

function FormErrorBanner({ children }: FormErrorBannerProps) {
  return (
    <Text
      bg="dangerBg"
      color="danger"
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

export default FormErrorBanner;
