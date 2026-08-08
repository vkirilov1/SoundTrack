import { Box, Text, chakra } from "@chakra-ui/react";
import type { AlbumArtist } from "../../types";

interface AddArtistMenuProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: AlbumArtist[];
  searching: boolean;
  adding: boolean;
  error: string | null;
  onAdd: (artist: AlbumArtist) => void;
}

function AddArtistMenu({
  query,
  onQueryChange,
  results,
  searching,
  adding,
  error,
  onAdd,
}: AddArtistMenuProps) {
  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      left="0"
      zIndex="10"
      w="240px"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.12)"
      p="10px"
    >
      <chakra.input
        type="text"
        placeholder="Search for an artist"
        autoFocus
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        w="100%"
        font="inherit"
        fontSize="13px"
        color="ink"
        bg="bg"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
        px="8px"
        py="6px"
        outline="none"
        _focus={{ borderColor: "accent" }}
      />

      {searching && (
        <Text m="8px 2px 0" fontSize="12px" color="text">
          Searching…
        </Text>
      )}

      {!searching && query.trim() && results.length === 0 && (
        <Text m="8px 2px 0" fontSize="12px" color="text">
          No artists found.
        </Text>
      )}

      {!searching && results.length > 0 && (
        <chakra.ul
          listStyle="none"
          m="8px 0 0"
          p="0"
          maxH="160px"
          overflowY="auto"
        >
          {results.map((result) => (
            <li key={result.id}>
              <chakra.button
                type="button"
                onClick={() => onAdd(result)}
                disabled={adding}
                w="100%"
                textAlign="left"
                font="inherit"
                fontSize="13px"
                color="ink"
                bg="none"
                border="none"
                borderRadius="md"
                p="8px"
                cursor="pointer"
                _hover={adding ? undefined : { bg: "border" }}
                _disabled={{ cursor: "default", opacity: 0.6 }}
              >
                {result.name}
              </chakra.button>
            </li>
          ))}
        </chakra.ul>
      )}

      {error && (
        <Text m="8px 2px 0" fontSize="12px" color="danger">
          {error}
        </Text>
      )}
    </Box>
  );
}

export default AddArtistMenu;
