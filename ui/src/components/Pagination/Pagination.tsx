import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { chakra, HStack } from "@chakra-ui/react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface EllipsisItem {
  ellipsis: true;
  key: string;
}

type PageItem = number | EllipsisItem;

const WINDOW_SIZE = 5;

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= WINDOW_SIZE + 2) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const start = Math.max(
    0,
    Math.min(current - Math.floor(WINDOW_SIZE / 2), total - WINDOW_SIZE),
  );
  const end = start + WINDOW_SIZE - 1;

  const items: PageItem[] = [];
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) {
    if (end < total - 2) items.push({ ellipsis: true, key: "e-end" });
    items.push(total - 1);
  }
  return items;
}

const baseButtonStyle = {
  border: "none",
  bg: "none",
  color: "text",
  fontSize: "15px",
  lineHeight: "1",
  px: "10px",
  py: "6px",
  borderRadius: "md",
  cursor: "pointer",
  transition: "color 0.15s ease, background-color 0.15s ease",
  outline: "none",
  _focusVisible: { boxShadow: "0 0 0 2px var(--chakra-colors-text)" },
} as const;

const hoverStyle = { color: "ink", bg: "border" };

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const [jumping, setJumping] = useState(false);
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const commitJump = () => {
    const parsed = Number(jumpValue);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed - 1);
    }
    setJumping(false);
    setJumpValue("");
  };

  const handleJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitJump();
    } else if (event.key === "Escape") {
      setJumping(false);
      setJumpValue("");
    }
  };

  const items = buildPageItems(page, totalPages);
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  return (
    <HStack
      as="nav"
      aria-label="Pagination"
      mt="24px"
      justify="center"
      gap="6px"
    >
      <chakra.button
        type="button"
        {...baseButtonStyle}
        fontSize="18px"
        fontWeight="600"
        px="12px"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        color={isFirstPage ? "border" : "text"}
        cursor={isFirstPage ? "default" : "pointer"}
        _hover={isFirstPage ? undefined : hoverStyle}
      >
        ‹
      </chakra.button>

      {items.map((item) => {
        if (typeof item === "number") {
          const isActive = item === page;
          return (
            <chakra.button
              key={item}
              type="button"
              {...baseButtonStyle}
              color={isActive ? "ink" : "text"}
              fontWeight={isActive ? "600" : "400"}
              bg={isActive ? "border" : "none"}
              onClick={() => onPageChange(item)}
              aria-current={isActive ? "page" : undefined}
              _hover={hoverStyle}
            >
              {item + 1}
            </chakra.button>
          );
        }

        if (jumping) {
          return (
            <chakra.input
              key={item.key}
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              autoFocus
              onChange={(event) => setJumpValue(event.target.value)}
              onKeyDown={handleJumpKeyDown}
              onBlur={commitJump}
              w="44px"
              px="6px"
              py="5px"
              fontSize="14px"
              textAlign="center"
              color="ink"
              border="1px solid"
              borderColor="border"
              borderRadius="md"
              bg="bg"
              outline="none"
              _focusVisible={{
                boxShadow: "0 0 0 2px var(--chakra-colors-accent)",
              }}
              style={
                {
                  MozAppearance: "textfield",
                } as CSSProperties
              }
            />
          );
        }

        return (
          <chakra.button
            key={item.key}
            type="button"
            {...baseButtonStyle}
            fontWeight="600"
            letterSpacing="1px"
            onClick={() => setJumping(true)}
            aria-label="Jump to page"
            _hover={hoverStyle}
          >
            …
          </chakra.button>
        );
      })}

      <chakra.button
        type="button"
        {...baseButtonStyle}
        fontSize="18px"
        fontWeight="600"
        px="12px"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        color={isLastPage ? "border" : "text"}
        cursor={isLastPage ? "default" : "pointer"}
        _hover={isLastPage ? undefined : hoverStyle}
      >
        ›
      </chakra.button>
    </HStack>
  );
}

export default Pagination;
