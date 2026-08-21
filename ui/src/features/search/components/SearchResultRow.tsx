import { Box, Image, Text, VStack } from "@chakra-ui/react";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import type { SearchResult } from "../types";
import ResultRowLink, { ResultRowButton, ResultTitle } from "./ResultRowLink";

interface SearchResultRowProps {
  result: SearchResult;
  /** Navigates to the album/artist page - the SearchBar behavior. */
  onNavigate?: () => void;
  /** When set, the row acts as a picker button instead of a link (e.g. chat topic select). */
  onSelect?: (result: SearchResult) => void;
}

function SearchResultRow({
  result,
  onNavigate,
  onSelect,
}: SearchResultRowProps) {
  const href =
    result.type === "ALBUM" ? `/album/${result.id}` : `/artist/${result.id}`;
  const imageSrc = result.imageUrl
    ? result.type === "ALBUM"
      ? coverImageUrl(result.imageUrl)
      : artistImageUrl(result.imageUrl)
    : null;

  const content = (
    <>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          flexShrink="0"
          boxSize="36px"
          borderRadius="md"
          objectFit="cover"
          bg="border"
        />
      ) : (
        <Box
          aria-hidden="true"
          flexShrink="0"
          boxSize="36px"
          borderRadius="md"
          bg="border"
        />
      )}
      <VStack minW="0" align="stretch" gap="0">
        <ResultTitle>{result.title}</ResultTitle>
        {result.subtitle && (
          <Text
            as="span"
            fontSize="12px"
            color="text"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {result.subtitle}
          </Text>
        )}
      </VStack>
    </>
  );

  if (onSelect) {
    return (
      <ResultRowButton onSelect={() => onSelect(result)}>
        {content}
      </ResultRowButton>
    );
  }

  return (
    <ResultRowLink to={href} onNavigate={onNavigate ?? (() => {})}>
      {content}
    </ResultRowLink>
  );
}

export default SearchResultRow;
