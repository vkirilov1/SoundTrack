import { Box, Heading, Image, Text } from "@chakra-ui/react";

interface FeatureRowProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageVariant: "chat" | "highlight";
  reverse?: boolean;
}

function FeatureRow({
  title,
  description,
  image,
  imageAlt,
  imageVariant,
  reverse = false,
}: FeatureRowProps) {
  const isHighlight = imageVariant === "highlight";

  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", md: reverse ? "row-reverse" : "row" }}
      alignItems="center"
      gap={{ base: "24px", md: "56px" }}
      py="40px"
    >
      <Box
        flex={{ md: "0 0 380px" }}
        w={{ base: "100%", md: "auto" }}
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow={isHighlight ? undefined : "hidden"}
        lineHeight={isHighlight ? undefined : "0"}
        bg={isHighlight ? "highlightBg" : undefined}
        p={isHighlight ? "32px" : undefined}
      >
        <Image
          src={image}
          alt={imageAlt}
          w="100%"
          maxW={isHighlight ? "220px" : undefined}
          h="auto"
          display="block"
          mx={isHighlight ? "auto" : undefined}
        />
      </Box>

      <Box flex="1">
        <Heading as="h3" fontSize="20px">
          {title}
        </Heading>
        <Text
          mt="10px"
          fontSize="15px"
          lineHeight="1.6"
          color="text"
          maxW="420px"
        >
          {description}
        </Text>
      </Box>
    </Box>
  );
}

export default FeatureRow;
