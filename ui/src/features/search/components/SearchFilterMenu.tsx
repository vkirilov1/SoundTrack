import { useState } from "react";
import { Box, Text, VStack, chakra } from "@chakra-ui/react";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
  type SearchMode,
} from "../hooks/useDebouncedSearch";
import SearchResultRow from "./SearchResultRow";
import UserResultRow from "./UserResultRow";
import type { SearchResult } from "../types";
import type { UserProfile } from "../../../types/auth";

export type FilterCategory = "albums" | "artists" | "users";

const DEFAULT_CATEGORIES: FilterCategory[] = ["albums", "artists", "users"];

interface SearchFilterMenuProps {
  categories?: FilterCategory[];
  onSelectMusic?: (result: SearchResult) => void;
  onSelectUser?: (user: UserProfile) => void;
  align?: "left" | "right";
}

function SearchFilterMenu({
  categories = DEFAULT_CATEGORIES,
  onSelectMusic,
  onSelectUser,
  align = "right",
}: SearchFilterMenuProps) {
  const showAlbums = categories.includes("albums");
  const showArtists = categories.includes("artists");
  const showUsers = categories.includes("users");
  const musicAvailable = showAlbums || showArtists;
  const canToggleMode = musicAvailable && showUsers;

  const [mode, setMode] = useState<SearchMode>(
    musicAvailable ? "music" : "users",
  );
  const [query, setQuery] = useState("");
  const { musicResults, userResults, loading } = useDebouncedSearch(
    query,
    mode,
  );

  const trimmedQuery = query.trim();
  const showHint = trimmedQuery.length < MIN_QUERY_LENGTH;
  const albums = showAlbums ? musicResults.albums : [];
  const artists = showArtists ? musicResults.artists : [];
  const hasMusicResults = albums.length > 0 || artists.length > 0;

  const musicLabel =
    showAlbums && showArtists
      ? "Filter by album or artist"
      : showAlbums
        ? "Filter by album"
        : "Filter by artist";

  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      {...(align === "right" ? { right: "0" } : { left: "0" })}
      zIndex="10"
      w="280px"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.12)"
      p="10px"
    >
      <chakra.input
        type="text"
        placeholder={mode === "music" ? musicLabel : "Filter by user"}
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
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

      {canToggleMode && (
        <chakra.button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === "music" ? "users" : "music"));
            setQuery("");
          }}
          display="block"
          mt="8px"
          bg="none"
          border="none"
          fontSize="12px"
          color="accent"
          cursor="pointer"
          p="0"
        >
          {mode === "music"
            ? "Filter by user instead"
            : `${musicLabel} instead`}
        </chakra.button>
      )}

      {showHint ? (
        <Text m="10px 2px 0" fontSize="12px" color="text">
          Keep typing to search…
        </Text>
      ) : loading ? (
        <Text m="10px 2px 0" fontSize="12px" color="text">
          Searching…
        </Text>
      ) : mode === "music" ? (
        hasMusicResults ? (
          <VStack
            align="stretch"
            gap="8px"
            mt="8px"
            maxH="220px"
            overflowY="auto"
          >
            {albums.map((result) => (
              <SearchResultRow
                key={`album-${result.id}`}
                result={result}
                onSelect={onSelectMusic}
              />
            ))}
            {artists.map((result) => (
              <SearchResultRow
                key={`artist-${result.id}`}
                result={result}
                onSelect={onSelectMusic}
              />
            ))}
          </VStack>
        ) : (
          <Text m="10px 2px 0" fontSize="12px" color="text">
            No results for &ldquo;{trimmedQuery}&rdquo;
          </Text>
        )
      ) : userResults.length > 0 ? (
        <VStack
          align="stretch"
          gap="8px"
          mt="8px"
          maxH="220px"
          overflowY="auto"
        >
          {userResults.map((user) => (
            <UserResultRow key={user.id} user={user} onSelect={onSelectUser} />
          ))}
        </VStack>
      ) : (
        <Text m="10px 2px 0" fontSize="12px" color="text">
          No users found for &ldquo;{trimmedQuery}&rdquo;
        </Text>
      )}
    </Box>
  );
}

export default SearchFilterMenu;
