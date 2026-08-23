import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box } from "@chakra-ui/react";

interface FeedSectionCardProps {
  children: ReactNode;
}

/**
 * Card shell for a home feed section, reusing the album detail card's exact recipe (border +
 * soft shadow, no fill) so it reads as "framed" rather than a heavy block. Fades and lifts in
 * the first time it scrolls into view, then leaves itself alone - a one-shot reveal via
 * IntersectionObserver, not a scroll-linked effect that re-triggers on every pass.
 */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function FeedSectionCard({ children }: FeedSectionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      opacity={visible ? 1 : 0}
      transform={visible ? "translateY(0)" : "translateY(16px)"}
      transition="opacity 0.5s ease-out, transform 0.5s ease-out"
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
