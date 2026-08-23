import type { ReactNode } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import ScreenshotFrame from "./ScreenshotFrame";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface FeatureRowProps {
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  overlayImage?: string;
  overlayImageAlt?: string;
  reverse?: boolean;
  /**
   * "split" (default) sits text and a screenshot side by side. "banner" stacks a
   * wide/short screenshot full-width below the
   * text
   */
  layout?: "split" | "banner";
}

function FeatureRow({
  title,
  description,
  image,
  imageAlt,
  overlayImage,
  overlayImageAlt,
  reverse = false,
  layout = "split",
}: FeatureRowProps) {
  const { ref, opacity, transform, transition } =
    useScrollReveal<HTMLDivElement>();

  const textBlock = (
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
  );

  if (layout === "banner") {
    return (
      <Box
        ref={ref}
        opacity={opacity}
        transform={transform}
        transition={transition}
        py="40px"
      >
        <Box maxW="560px" mx="auto" textAlign="center">
          <Heading as="h3" fontSize="20px">
            {title}
          </Heading>
          <Text mt="10px" fontSize="15px" lineHeight="1.6" color="text">
            {description}
          </Text>
        </Box>
        <Box mt="28px">
          <ScreenshotFrame src={image} alt={imageAlt} maxW="640px" />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      opacity={opacity}
      transform={transform}
      transition={transition}
      display="flex"
      flexDirection={{ base: "column", md: reverse ? "row-reverse" : "row" }}
      alignItems="center"
      gap={{ base: "48px", md: "56px" }}
      py="40px"
    >
      <Box flex={{ md: "0 0 380px" }} w={{ base: "100%", md: "auto" }}>
        <ScreenshotFrame
          src={image}
          alt={imageAlt}
          overlaySrc={overlayImage}
          overlayAlt={overlayImageAlt}
        />
      </Box>

      {textBlock}
    </Box>
  );
}

export default FeatureRow;
