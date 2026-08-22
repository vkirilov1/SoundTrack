import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Heading, chakra } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Pagination from "../../../components/Pagination/Pagination";
import FilterIcon from "../../../components/icons/FilterIcon";
import XIcon from "../../../components/icons/XIcon";
import { usePagedList } from "../../../hooks/usePagedList";
import { getAlbumsByGenre } from "../api/chartApi";
import type { ChartSortField } from "../types";
import type { SearchResult } from "../../search/types";
import SearchFilterMenu from "../../search/components/SearchFilterMenu";
import AlbumGrid from "./AlbumGrid";
import SortControl from "./SortControl";

const PAGE_SIZE = 20;

function GenrePage() {
  const { name } = useParams<{ name: string }>();
  const genre = name ? decodeURIComponent(name) : "";
  const invalidGenre = !genre;

  const [sort, setSort] = useState<ChartSortField>("rating");
  const [descending, setDescending] = useState(true);

  const [artistFilter, setArtistFilter] = useState<SearchResult | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filterMenuOpen]);

  const fetchAlbums = useCallback(
    (page: number) =>
      getAlbumsByGenre(
        genre,
        sort,
        descending,
        artistFilter?.id ?? null,
        page,
        PAGE_SIZE,
      ),
    [genre, sort, descending, artistFilter],
  );
  const { items, page, totalPages, loading, listLoading, goToPage } =
    usePagedList(fetchAlbums, { enabled: !invalidGenre });

  if (invalidGenre) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This genre doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Flex align="center" justify="space-between" flexWrap="wrap" gap="16px">
        <Heading as="h1" fontSize="28px" color="accent">
          {genre}
        </Heading>
        <Flex align="center" gap="10px">
          <SortControl
            sort={sort}
            descending={descending}
            onSortChange={setSort}
            onToggleDirection={() => setDescending((prev) => !prev)}
          />
          <Box position="relative" ref={filterMenuRef}>
            <chakra.button
              type="button"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
              aria-label="Filter by artist"
              aria-expanded={filterMenuOpen}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="36px"
              bg="none"
              border="none"
              borderRadius="full"
              color={artistFilter ? "accent" : "ink"}
              cursor="pointer"
              _hover={{ bg: "border" }}
            >
              <FilterIcon size={17} />
            </chakra.button>

            {filterMenuOpen && (
              <SearchFilterMenu
                categories={["artists"]}
                onSelectMusic={(result) => {
                  setArtistFilter(result);
                  setFilterMenuOpen(false);
                }}
              />
            )}
          </Box>
        </Flex>
      </Flex>

      {artistFilter && (
        <Flex mt="12px">
          <chakra.span
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="10px"
            py="5px"
            fontSize="12px"
            fontWeight="600"
            color="ink"
            bg="accentBg"
            borderRadius="full"
          >
            Artist: {artistFilter.title}
            <chakra.button
              type="button"
              onClick={() => setArtistFilter(null)}
              aria-label="Clear artist filter"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              bg="none"
              border="none"
              color="inherit"
              cursor="pointer"
              p="0"
            >
              <XIcon size={10} />
            </chakra.button>
          </chakra.span>
        </Flex>
      )}

      <Box mt="24px">
        <PagedSection
          loading={loading}
          listLoading={listLoading}
          isEmpty={items.length === 0}
          emptyMessage={
            artistFilter
              ? `No ${artistFilter.title} albums found for "${genre}".`
              : `No albums found for "${genre}".`
          }
          spinnerLabel="Loading albums"
        >
          <AlbumGrid
            albums={items}
            rankOffset={page * PAGE_SIZE}
            displayRank={false}
          />
        </PagedSection>
      </Box>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </PageContainer>
  );
}

export default GenrePage;
