import { Fragment } from "react";
import { chakra, HStack, Text } from "@chakra-ui/react";
import type { ChartSortField } from "../types";

const SORT_FIELDS: { value: ChartSortField; label: string }[] = [
  { value: "alphabetically", label: "Alphabetically" },
  { value: "rating", label: "Rating" },
  { value: "releaseDate", label: "Release Date" },
  { value: "reviewsCount", label: "Review Count" },
];

interface SortControlProps {
  sort: ChartSortField;
  descending: boolean;
  onSortChange: (sort: ChartSortField) => void;
  onToggleDirection: () => void;
}

function SortControl({
  sort,
  descending,
  onSortChange,
  onToggleDirection,
}: SortControlProps) {
  return (
    <HStack gap="8px" fontSize="13px">
      {SORT_FIELDS.map((field, index) => (
        <Fragment key={field.value}>
          {index > 0 && (
            <Text as="span" color="text" opacity="0.5">
              /
            </Text>
          )}
          <chakra.button
            type="button"
            onClick={() => onSortChange(field.value)}
            bg="none"
            border="none"
            p="0"
            cursor="pointer"
            fontSize="inherit"
            fontWeight={sort === field.value ? "700" : "400"}
            color={sort === field.value ? "accent" : "text"}
            _hover={{ color: sort === field.value ? "accentHover" : "ink" }}
          >
            {field.label}
          </chakra.button>
        </Fragment>
      ))}

      <chakra.button
        type="button"
        onClick={onToggleDirection}
        aria-label={descending ? "Sort descending" : "Sort ascending"}
        title={descending ? "Sort descending" : "Sort ascending"}
        ml="4px"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        bg="none"
        border="none"
        p="0"
        color="text"
        cursor="pointer"
        _hover={{ color: "ink" }}
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: descending ? undefined : "rotate(180deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <path d="M12 4v15M6 13l6 6 6-6" />
        </svg>
      </chakra.button>
    </HStack>
  );
}

export default SortControl;
