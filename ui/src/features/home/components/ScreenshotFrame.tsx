import { Box, Image } from "@chakra-ui/react";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  overlaySrc?: string;
  overlayAlt?: string;
  maxW?: string;
}

function ScreenshotFrame({
  src,
  alt,
  overlaySrc,
  overlayAlt,
  maxW = "380px",
}: ScreenshotFrameProps) {
  return (
    <Box position="relative" w="100%" maxW={maxW} mx="auto">
      <Box
        position="absolute"
        inset="10%"
        borderRadius="full"
        bg="accent"
        opacity="0.16"
        filter="blur(48px)"
        zIndex="0"
      />

      <Box
        position="relative"
        zIndex="1"
        borderRadius="lg"
        overflow="hidden"
        bg="screenshotFrame"
        border="1px solid"
        borderColor="screenshotFrameBorder"
        boxShadow="0 20px 44px rgba(0, 0, 0, 0.25)"
        lineHeight="0"
      >
        <Image src={src} alt={alt} w="100%" h="auto" display="block" />
      </Box>

      {overlaySrc && (
        <Box
          position="absolute"
          bottom="-28px"
          left="-28px"
          zIndex="2"
          w="58%"
          borderRadius="md"
          overflow="hidden"
          bg="screenshotFrame"
          border="1px solid"
          borderColor="screenshotFrameBorder"
          boxShadow="0 14px 30px rgba(0, 0, 0, 0.3)"
          lineHeight="0"
        >
          <Image
            src={overlaySrc}
            alt={overlayAlt}
            w="100%"
            h="auto"
            display="block"
          />
        </Box>
      )}
    </Box>
  );
}

export default ScreenshotFrame;
