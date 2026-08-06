import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Heading, HStack } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Pagination from "../../../components/Pagination/Pagination";
import { usePagedList } from "../../../hooks/usePagedList";
import { getTopAlbumsForYear } from "../api/chartApi";
import AlbumGrid from "./AlbumGrid";

const PAGE_SIZE = 20;

function YearPage() {
  const { year } = useParams<{ year: string }>();
  const yearNum = Number(year);
  const invalidYear = !Number.isFinite(yearNum);

  const fetchAlbums = useCallback(
    (page: number) => getTopAlbumsForYear(yearNum, page, PAGE_SIZE),
    [yearNum],
  );
  const { items, page, totalPages, loading, listLoading, goToPage } =
    usePagedList(fetchAlbums, { enabled: !invalidYear });

  if (invalidYear) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This year doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Heading as="h1" fontSize="28px">
        <HStack>
          Highest rated of <Box color="accent">{yearNum}</Box>
        </HStack>
      </Heading>

      <Box mt="24px">
        <PagedSection
          loading={loading}
          listLoading={listLoading}
          isEmpty={items.length === 0}
          emptyMessage={`No albums found for ${yearNum}.`}
          spinnerLabel="Loading albums"
        >
          <AlbumGrid
            albums={items}
            rankOffset={page * PAGE_SIZE}
            displayRank={true}
          />
        </PagedSection>
      </Box>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </PageContainer>
  );
}

export default YearPage;
