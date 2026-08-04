import { useState } from "react";
import { Box, chakra, HStack } from "@chakra-ui/react";
import { STAR_PATH } from "../../../utils/svgPaths";

interface RatingPickerProps {
  value: number | null;
  onChange: (value: number) => void;
}

function RatingPicker({ value, onChange }: RatingPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <HStack
      flexShrink="0"
      gap="4px"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(null)}
    >
      <chakra.button
        type="button"
        aria-label="0 out of 5 stars"
        onMouseEnter={() => setHovered(0)}
        onClick={() => onChange(0)}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="20px"
        h="22px"
        mr="2px"
        fontSize="12px"
        fontWeight="600"
        color={value === 0 ? "star" : "starEmpty"}
        bg="none"
        border="none"
        cursor="pointer"
      >
        0
      </chakra.button>
      {[1, 2, 3, 4, 5].map((star) => {
        const fraction = Math.min(1, Math.max(0, shown - (star - 1)));
        return (
          <Box
            key={star}
            position="relative"
            display="inline-block"
            w="22px"
            h="22px"
          >
            <svg
              viewBox="0 0 24 24"
              width={22}
              height={22}
              style={{ display: "block" }}
            >
              <path d={STAR_PATH} fill="var(--chakra-colors-star-empty)" />
            </svg>
            <Box
              position="absolute"
              top="0"
              left="0"
              h="100%"
              overflow="hidden"
              display="block"
              w={`${fraction * 100}%`}
            >
              <svg viewBox="0 0 24 24" width={22} height={22}>
                <path d={STAR_PATH} fill="var(--chakra-colors-star)" />
              </svg>
            </Box>
            <chakra.button
              type="button"
              aria-label={`${star - 0.5} out of 5 stars`}
              onMouseEnter={() => setHovered(star - 0.5)}
              onClick={() => onChange(star - 0.5)}
              position="absolute"
              top="0"
              left="0"
              w="50%"
              h="100%"
              bg="none"
              border="none"
              p="0"
              cursor="pointer"
            />
            <chakra.button
              type="button"
              aria-label={`${star} out of 5 stars`}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
              position="absolute"
              top="0"
              right="0"
              w="50%"
              h="100%"
              bg="none"
              border="none"
              p="0"
              cursor="pointer"
            />
          </Box>
        );
      })}
    </HStack>
  );
}

export default RatingPicker;
