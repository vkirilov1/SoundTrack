import { Box, Image, Text, VStack } from "@chakra-ui/react";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import type { SearchResult } from "../types";
import ResultRowLink, { ResultTitle } from "./ResultRowLink";

interface SearchResultRowProps {
  result: SearchResult;
  onNavigate: () => void;
}

function SearchResultRow({ result, onNavigate }: SearchResultRowProps) {
  const href =
    result.type === "ALBUM" ? `/album/${result.id}` : `/artist/${result.id}`;
  const imageSrc = result.imageUrl
    ? result.type === "ALBUM"
      ? coverImageUrl(result.imageUrl)
      : artistImageUrl(result.imageUrl)
    : null;

  return (
    <ResultRowLink to={href} onNavigate={onNavigate}>
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
    </ResultRowLink>
  );
}

export default SearchResultRow;
