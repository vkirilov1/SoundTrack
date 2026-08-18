import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Heading } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Pagination from "../../../components/Pagination/Pagination";
import AlbumGrid from "./AlbumGrid";
import YearFilterBar from "./YearFilterBar";
import { usePagedList } from "../../../hooks/usePagedList";
import {
  getAvailableYears,
  getTopAlbumsForYear,
  getTopAlbumsOverall,
} from "../api/chartApi";

const PAGE_SIZE = 20;

function ChartsPage() {
  const { year: yearParam } = useParams<{ year?: string }>();
  const navigate = useNavigate();

  const selectedYear = yearParam !== undefined ? Number(yearParam) : null;
  const invalidYear = yearParam !== undefined && !Number.isFinite(selectedYear);

  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    getAvailableYears()
      .then(setYears)
      .catch(() => {});
  }, []);

  const fetchAlbums = useCallback(
    (page: number) =>
      selectedYear !== null
        ? getTopAlbumsForYear(selectedYear, page, PAGE_SIZE)
        : getTopAlbumsOverall(page, PAGE_SIZE),
    [selectedYear],
  );
  const { items, page, totalPages, loading, listLoading, goToPage } =
    usePagedList(fetchAlbums, { enabled: !invalidYear });

  function handleSelectYear(year: number | null) {
    navigate(year === null ? "/charts" : `/charts/${year}`);
  }

  if (invalidYear) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This year doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Heading as="h1" fontSize="28px" m="0">
        Highest rated of{" "}
        <Box as="span" color="accent">
          {selectedYear !== null ? `${selectedYear}` : "all time"}
        </Box>
      </Heading>

      <Box mt="20px">
        <YearFilterBar
          years={years}
          selectedYear={selectedYear}
          onSelectYear={handleSelectYear}
        />
      </Box>

      <Box mt="20px" borderBottom="1px solid" borderColor="border" />

      <Box mt="24px">
        <PagedSection
          loading={loading}
          listLoading={listLoading}
          isEmpty={items.length === 0}
          emptyMessage={
            selectedYear !== null
              ? `No albums found for ${selectedYear}.`
              : "No albums found."
          }
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

export default ChartsPage;
