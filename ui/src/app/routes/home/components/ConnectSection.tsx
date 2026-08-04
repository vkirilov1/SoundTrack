import { Box, Heading } from "@chakra-ui/react";
import chatPlaceholder from "../../../../assets/chatPlaceholder.png";
import listsPlaceholder from "../../../../assets/listsPlaceholder.png";
import FeatureRow from "./FeatureRow";

function ConnectSection() {
  return (
    <Box w="100%" maxW="contentWidth" mx="auto" py="64px" px="24px">
      <Heading as="h2" fontSize="28px">
        Connect
      </Heading>

      <FeatureRow
        title="Chat Live"
        description="Connect with people sharing your taste. Discuss new releases, celebrate your favorites, and share your passion with fellow music lovers."
        image={chatPlaceholder}
        imageAlt="Chat conversation preview"
        imageVariant="chat"
      />

      <FeatureRow
        title="Highlight your favorites"
        description="Build playlists of your favorite albums. Organize your music collection, save your all-time favorites, and share lists with the world, that reflect your unique taste."
        image={listsPlaceholder}
        imageAlt="Checklist of favorite albums"
        imageVariant="highlight"
        reverse
      />
    </Box>
  );
}

export default ConnectSection;
