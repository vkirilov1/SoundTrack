import { Box, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import icon404 from "../../assets/404Icon.png";

function NotFoundRoute() {
  return (
    <Box
      as="section"
      w="100%"
      maxW="contentWidth"
      mx="auto"
      px="24px"
      py="48px"
      textAlign="center"
    >
      <Image
        src={icon404}
        alt="404 - page not found"
        w="100%"
        maxW="320px"
        h="auto"
        mx="auto"
      />
      <Text mt="12px" color="text">
        This page doesn't exist yet.
      </Text>
      <Link
        asChild
        display="inline-block"
        mt="24px"
        color="accent"
        textDecoration="underline"
      >
        <RouterLink to="/">Back to home</RouterLink>
      </Link>
    </Box>
  );
}

export default NotFoundRoute;
