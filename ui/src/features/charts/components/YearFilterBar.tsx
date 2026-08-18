import { useEffect, useRef, useState } from "react";
import { Box, chakra } from "@chakra-ui/react";

interface YearFilterBarProps {
  years: number[];
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
}

interface YearPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const FADE_WIDTH = 36;

const arrowButtonStyle = {
  type: "button",
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSize: "30px",
  borderRadius: "full",
  border: "1px solid",
  borderColor: "border",
  bg: "bg",
  color: "text",
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: "1",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
  transition: "background-color 0.15s ease, color 0.15s ease",
  _hover: { bg: "border", color: "ink" },
} as const;

function YearPill({ label, selected, onClick }: YearPillProps) {
  return (
    <chakra.button
      type="button"
      data-selected={selected}
      onClick={onClick}
      flexShrink="0"
      px="16px"
      py="8px"
      fontSize="14px"
      fontWeight="600"
      borderRadius="full"
      border="none"
      bg={selected ? "accent" : "accentBg"}
      color={selected ? "white" : "ink"}
      cursor="pointer"
      whiteSpace="nowrap"
      transition="background-color 0.15s ease, color 0.15s ease"
      _hover={selected ? undefined : { bg: "accent", color: "white" }}
    >
      {label}
    </chakra.button>
  );
}

function YearFilterBar({
  years,
  selectedYear,
  onSelectYear,
}: YearFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [years]);

  useEffect(() => {
    scrollRef.current
      ?.querySelector<HTMLElement>('[data-selected="true"]')
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
  }, [selectedYear]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  const leftStop = canScrollLeft
    ? `transparent 0, black ${FADE_WIDTH}px`
    : "black 0";
  const rightStop = canScrollRight
    ? `black calc(100% - ${FADE_WIDTH}px), transparent 100%`
    : "black 100%";
  const fadeMask = `linear-gradient(to right, ${leftStop}, ${rightStop})`;

  return (
    <Box position="relative">
      <Box
        ref={scrollRef}
        onScroll={updateScrollState}
        overflowX="auto"
        display="flex"
        gap="8px"
        py="2px"
        pl={canScrollLeft ? `${FADE_WIDTH}px` : "0"}
        pr={canScrollRight ? `${FADE_WIDTH}px` : "0"}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
        }}
      >
        <YearPill
          label="All Time"
          selected={selectedYear === null}
          onClick={() => onSelectYear(null)}
        />
        {years.map((year) => (
          <YearPill
            key={year}
            label={String(year)}
            selected={selectedYear === year}
            onClick={() => onSelectYear(year)}
          />
        ))}
      </Box>

      {canScrollLeft && (
        <chakra.button
          {...arrowButtonStyle}
          left="0"
          onClick={() => scrollByAmount(-240)}
          aria-label="Scroll years left"
        >
          ‹
        </chakra.button>
      )}

      {canScrollRight && (
        <chakra.button
          {...arrowButtonStyle}
          right="0"
          onClick={() => scrollByAmount(240)}
          aria-label="Scroll years right"
        >
          ›
        </chakra.button>
      )}
    </Box>
  );
}

export default YearFilterBar;
