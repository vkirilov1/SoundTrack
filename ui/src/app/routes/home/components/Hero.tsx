import { Box, Heading, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import concertPhoto from "../../../../assets/concert.jpg";

function Hero() {
  return (
    <Box
      w="100%"
      maxW="contentWidth"
      mx="auto"
      pt={{ base: "40px", sm: "56px" }}
      px="24px"
    >
      <Box maxW="620px">
        <Heading
          as="h1"
          fontSize={{ base: "32px", sm: "42px" }}
          lineHeight="1.15"
          letterSpacing="-0.5px"
        >
          Share your thoughts
        </Heading>
        <Text mt="16px" fontSize="16px" lineHeight="1.6" color="text">
          Rate and review your favorite.. and least favorite albums and artists
          from every era and every corner of the world.
        </Text>
        <Link
          asChild
          display="inline-block"
          mt="24px"
          bg="accent"
          color="white"
          fontSize="14px"
          fontWeight="600"
          textDecoration="none"
          px="28px"
          py="12px"
          borderRadius="md"
          transition="background 0.2s"
          _hover={{ bg: "accentHover", color: "white" }}
        >
          <RouterLink to="/register">Register</RouterLink>
        </Link>
      </Box>

      <Box mt="40px" borderRadius="lg" overflow="hidden" lineHeight="0">
        <Image
          src={concertPhoto}
          alt="Crowd at a live concert"
          w="100%"
          h="auto"
          maxH="480px"
          objectFit="cover"
          display="block"
        />
      </Box>
    </Box>
  );
}

export default Hero;
