import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { keyframes } from "@emotion/react";
import { Box, chakra, Text, VStack } from "@chakra-ui/react";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
} from "../hooks/useDebouncedSearch";
import type { SearchMode } from "../hooks/useDebouncedSearch";
import { useDropdownAnchor } from "../hooks/useDropdownAnchor";
import SearchResultRow from "./SearchResultRow";
import UserResultRow from "./UserResultRow";

const searchSlideIn = keyframes`
  from { opacity: 0; transform: scaleX(0.85); }
  to { opacity: 1; transform: scaleX(1); }
`;

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("music");

  const inputRef = useRef<HTMLInputElement>(null);

  const closeDropdown = useCallback(() => setOpen(false), []);
  const { containerRef, dropdownRef, anchorRect } = useDropdownAnchor(
    open,
    closeDropdown,
  );
  const { musicResults, userResults, loading, reset } = useDebouncedSearch(
    query,
    mode,
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setMode("music");
    reset();
  }

  const trimmedQuery = query.trim();
  const showHint = trimmedQuery.length < MIN_QUERY_LENGTH;
  const hasMusicResults =
    musicResults.albums.length > 0 || musicResults.artists.length > 0;

  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      flex={open ? "1" : undefined}
      maxW={open ? "700px" : undefined}
      ref={containerRef}
    >
      {!open ? (
        <chakra.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          bg="none"
          border="none"
          color="white"
          p="4px"
          cursor="pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 16L12.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </chakra.button>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          gap="8px"
          w="100%"
          bg="transparent"
          pt="6px"
          pr="8px"
          pb="6px"
          pl="14px"
          transformOrigin="right center"
          css={{ animation: `${searchSlideIn} 0.10s ease-out` }}
        >
          <chakra.input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === "music" ? "Search albums and artists" : "Search users"
            }
            flex="1"
            minW="0"
            fontSize="14px"
            color="white"
            bg="none"
            border="none"
            outline="none"
            css={{ "&::placeholder": { color: "rgba(255, 255, 255, 0.6)" } }}
          />
          <chakra.button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            flexShrink="0"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="22px"
            bg="none"
            border="none"
            borderRadius="full"
            color="rgba(255, 255, 255, 0.8)"
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.15)", color: "white" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </chakra.button>
        </Box>
      )}

      {open &&
        anchorRect &&
        createPortal(
          <Box
            ref={dropdownRef}
            zIndex={1000}
            maxH="420px"
            overflowY="auto"
            bg="bg"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            boxShadow="0 12px 28px rgba(0, 0, 0, 0.15)"
            p="8px"
            style={{
              position: "fixed",
              top: anchorRect.bottom + 8,
              left: anchorRect.left,
              width: anchorRect.width,
            }}
          >
            <chakra.button
              type="button"
              onClick={() =>
                setMode((prev) => (prev === "music" ? "users" : "music"))
              }
              display="block"
              w="100%"
              textAlign="left"
              bg="none"
              border="none"
              borderBottom="1px solid"
              borderColor="border"
              fontSize="12px"
              color="accent"
              px="6px"
              pt="6px"
              pb="10px"
              mb="8px"
              cursor="pointer"
            >
              {mode === "music"
                ? "Search for users instead"
                : "Search for albums & artists instead"}
            </chakra.button>

            {showHint ? (
              <Text
                m="0"
                px="6px"
                py="16px"
                textAlign="center"
                fontSize="13px"
                color="text"
              >
                Keep typing to search…
              </Text>
            ) : loading ? (
              <Text
                m="0"
                px="6px"
                py="16px"
                textAlign="center"
                fontSize="13px"
                color="text"
              >
                Searching…
              </Text>
            ) : mode === "music" ? (
              hasMusicResults ? (
                <VStack align="stretch" gap="12px">
                  {musicResults.albums.length > 0 && (
                    <Box>
                      <Text
                        display="block"
                        px="6px"
                        pb="6px"
                        fontSize="11px"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                        color="text"
                        opacity="0.7"
                      >
                        Albums
                      </Text>
                      {musicResults.albums.map((result) => (
                        <SearchResultRow
                          key={`album-${result.id}`}
                          result={result}
                          onNavigate={handleClose}
                        />
                      ))}
                    </Box>
                  )}
                  {musicResults.artists.length > 0 && (
                    <Box>
                      <Text
                        display="block"
                        px="6px"
                        pb="6px"
                        fontSize="11px"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                        color="text"
                        opacity="0.7"
                      >
                        Artists
                      </Text>
                      {musicResults.artists.map((result) => (
                        <SearchResultRow
                          key={`artist-${result.id}`}
                          result={result}
                          onNavigate={handleClose}
                        />
                      ))}
                    </Box>
                  )}
                </VStack>
              ) : (
                <Text
                  m="0"
                  px="6px"
                  py="16px"
                  textAlign="center"
                  fontSize="13px"
                  color="text"
                >
                  No results for &ldquo;{trimmedQuery}&rdquo;
                </Text>
              )
            ) : userResults.length > 0 ? (
              <Box>
                {userResults.map((user) => (
                  <UserResultRow
                    key={user.id}
                    user={user}
                    onNavigate={handleClose}
                  />
                ))}
              </Box>
            ) : (
              <Text
                m="0"
                px="6px"
                py="16px"
                textAlign="center"
                fontSize="13px"
                color="text"
              >
                No users found for &ldquo;{trimmedQuery}&rdquo;
              </Text>
            )}
          </Box>,
          document.body,
        )}
    </Box>
  );
}

export default SearchBar;
