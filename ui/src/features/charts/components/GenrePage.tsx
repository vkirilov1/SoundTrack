import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Heading } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Pagination from "../../../components/Pagination/Pagination";
import { usePagedList } from "../../../hooks/usePagedList";
import { getAlbumsByGenre } from "../api/chartApi";
import type { ChartSortField } from "../types";
import AlbumGrid from "./AlbumGrid";
import SortControl from "./SortControl";

const PAGE_SIZE = 20;

function GenrePage() {
  const { name } = useParams<{ name: string }>();
  const genre = name ? decodeURIComponent(name) : "";
  const invalidGenre = !genre;

  const [sort, setSort] = useState<ChartSortField>("rating");
  const [descending, setDescending] = useState(true);

  const fetchAlbums = useCallback(
    (page: number) =>
      getAlbumsByGenre(genre, sort, descending, page, PAGE_SIZE),
    [genre, sort, descending],
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
        <SortControl
          sort={sort}
          descending={descending}
          onSortChange={setSort}
          onToggleDirection={() => setDescending((prev) => !prev)}
        />
      </Flex>

      <Box mt="24px">
        <PagedSection
          loading={loading}
          listLoading={listLoading}
          isEmpty={items.length === 0}
          emptyMessage={`No albums found for "${genre}".`}
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
