import { Box, HStack } from "@chakra-ui/react";
import { STAR_PATH } from "../../utils/svgPaths";

interface StarRatingProps {
  rating: number;
  size?: number;
}

function StarRating({ rating, size = 16 }: StarRatingProps) {
  const fractions = [0, 1, 2, 3, 4].map((i) =>
    Math.min(1, Math.max(0, rating - i)),
  );

  return (
    <HStack
      as="span"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      gap="1px"
      flexShrink="0"
    >
      {fractions.map((fraction, index) => (
        <Box
          key={index}
          position="relative"
          display="inline-block"
          w={`${size}px`}
          h={`${size}px`}
          color="starEmpty"
        >
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="currentColor"
            style={{ display: "block" }}
          >
            <path d={STAR_PATH} />
          </svg>
          <Box
            position="absolute"
            top="0"
            left="0"
            h="100%"
            overflow="hidden"
            display="block"
            w={`${fraction * 100}%`}
            color="star"
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              fill="currentColor"
              style={{ display: "block" }}
            >
              <path d={STAR_PATH} />
            </svg>
          </Box>
        </Box>
      ))}
    </HStack>
  );
}

export default StarRating;
