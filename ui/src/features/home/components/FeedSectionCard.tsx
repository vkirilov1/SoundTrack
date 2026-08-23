import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface FeedSectionCardProps {
  children: ReactNode;
}

function FeedSectionCard({ children }: FeedSectionCardProps) {
  const { ref, opacity, transform, transition } =
    useScrollReveal<HTMLDivElement>();

  return (
    <Box
      ref={ref}
      opacity={opacity}
      transform={transform}
      transition={transition}
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.06)"
      p="24px"
    >
      {children}
    </Box>
  );
}

export default FeedSectionCard;
