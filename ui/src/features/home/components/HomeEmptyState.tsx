import { Box, Image, Text } from "@chakra-ui/react";
import missingResourcesIcon from "../../../assets/MissingResources.png";

interface HomeEmptyStateProps {
  message: string;
}

function HomeEmptyState({ message }: HomeEmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="8px"
      py="28px"
    >
      <Image src={missingResourcesIcon} alt="" boxSize="40px" opacity="0.55" />
      <Text m="0" fontSize="14px" color="text" textAlign="center" maxW="360px">
        {message}
      </Text>
    </Box>
  );
}

export default HomeEmptyState;
