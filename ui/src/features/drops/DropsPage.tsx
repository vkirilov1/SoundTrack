import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Heading, chakra } from "@chakra-ui/react";
import { useAuth } from "../auth/stores/useAuth";
import MembersOnlyMessage from "../../components/MembersOnlyMessage/MembersOnlyMessage";
import PageContainer from "../../components/PageContainer/PageContainer";
import PagedSection from "../../components/PagedSection/PagedSection";
import Pagination from "../../components/Pagination/Pagination";
import PlusIcon from "../../components/icons/PlusIcon";
import AlbumGrid from "../charts/components/AlbumGrid";
import { usePagedList } from "../../hooks/usePagedList";
import { getRecentlyAdded } from "../charts/api/chartApi";
import CreateAlbumModal from "../albums/components/admin/CreateAlbumModal";
import SuggestAlbumModal from "./components/SuggestAlbumModal";
import {
  deleteUpcomingRelease,
  getUpcomingReleases,
  publishUpcomingRelease,
} from "../upcoming/api/upcomingApi";
import UpcomingReleaseRow from "../upcoming/components/UpcomingReleaseRow";

type DropsTab = "recent" | "upcoming";

const PAGE_SIZE = 20;

interface DropsTabButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function DropsTabButton({ label, selected, onClick }: DropsTabButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      px="16px"
      py="8px"
      fontSize="14px"
      fontWeight="600"
      borderRadius="full"
      border="none"
      bg={selected ? "accent" : "accentBg"}
      color={selected ? "white" : "ink"}
      cursor="pointer"
      transition="background-color 0.15s ease, color 0.15s ease"
      _hover={selected ? undefined : { bg: "accent", color: "white" }}
    >
      {label}
    </chakra.button>
  );
}

function DropsPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<DropsTab>(
    searchParams.get("tab") === "upcoming" ? "upcoming" : "recent",
  );
  const [creating, setCreating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const fetchRecent = useCallback(
    (page: number) => getRecentlyAdded(page, PAGE_SIZE),
    [],
  );
  const {
    items: recentItems,
    page: recentPage,
    totalPages: recentTotalPages,
    loading: recentLoading,
    listLoading: recentListLoading,
    goToPage: goToRecentPage,
  } = usePagedList(fetchRecent, { enabled: tab === "recent" });

  const fetchUpcoming = useCallback(
    (page: number) => getUpcomingReleases(page, PAGE_SIZE),
    [],
  );
  const {
    items: upcomingItems,
    setItems: setUpcomingItems,
    page: upcomingPage,
    totalPages: upcomingTotalPages,
    loading: upcomingLoading,
    listLoading: upcomingListLoading,
    goToPage: goToUpcomingPage,
    reload: reloadUpcoming,
  } = usePagedList(fetchUpcoming, { enabled: tab === "upcoming" });

  function handlePublish(id: number) {
    return publishUpcomingRelease(id).then(() => {
      setUpcomingItems((prev) => prev.filter((r) => r.id !== id));
    });
  }

  function handleCancel(id: number) {
    return deleteUpcomingRelease(id).then(() => {
      setUpcomingItems((prev) => prev.filter((r) => r.id !== id));
    });
  }

  if (!isLoading && !user) {
    return (
      <MembersOnlyMessage
        header={"Drops are for members only"}
        content={"Sign in to browse and suggest new drops."}
      />
    );
  }

  return (
    <PageContainer>
      <Heading as="h1" fontSize="28px" m="0">
        <chakra.span color="accent">Drops</chakra.span>
      </Heading>

      <Flex
        align="center"
        justify="space-between"
        gap="12px"
        mt="20px"
        wrap="wrap"
      >
        <Flex gap="8px">
          <DropsTabButton
            label="Recently added"
            selected={tab === "recent"}
            onClick={() => setTab("recent")}
          />
          <DropsTabButton
            label="Upcoming"
            selected={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          />
        </Flex>

        <chakra.button
          type="button"
          onClick={() => (isAdmin ? setCreating(true) : setSuggesting(true))}
          aria-label={isAdmin ? "Add an album" : "Suggest an album"}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="36px"
          bg="none"
          border="none"
          borderRadius="full"
          color="ink"
          cursor="pointer"
          _hover={{ bg: "border" }}
        >
          <PlusIcon size={20} />
        </chakra.button>
      </Flex>

      <Box mt="20px" borderBottom="1px solid" borderColor="border" />

      {tab === "recent" && (
        <Box mt="24px">
          <PagedSection
            loading={recentLoading}
            listLoading={recentListLoading}
            isEmpty={recentItems.length === 0}
            emptyMessage="No albums added in the last 30 days."
            spinnerLabel="Loading recent drops"
          >
            <AlbumGrid
              albums={recentItems}
              rankOffset={recentPage * PAGE_SIZE}
              displayRank={false}
            />
          </PagedSection>
          <Pagination
            page={recentPage}
            totalPages={recentTotalPages}
            onPageChange={goToRecentPage}
          />
        </Box>
      )}

      {tab === "upcoming" && (
        <Box mt="24px">
          <PagedSection
            loading={upcomingLoading}
            listLoading={upcomingListLoading}
            isEmpty={upcomingItems.length === 0}
            emptyMessage="No upcoming releases yet."
            spinnerLabel="Loading upcoming releases"
          >
            <chakra.ul listStyle="none" m="0" p="0">
              {upcomingItems.map((release) => (
                <UpcomingReleaseRow
                  key={release.id}
                  release={release}
                  isAdmin={isAdmin}
                  onPublish={handlePublish}
                  onCancel={handleCancel}
                />
              ))}
            </chakra.ul>
          </PagedSection>
          <Pagination
            page={upcomingPage}
            totalPages={upcomingTotalPages}
            onPageChange={goToUpcomingPage}
          />
        </Box>
      )}

      {creating && (
        <CreateAlbumModal
          onClose={() => setCreating(false)}
          onUpcomingCreated={() => {
            if (tab === "upcoming") {
              reloadUpcoming();
            } else {
              setTab("upcoming");
            }
          }}
        />
      )}
      {suggesting && <SuggestAlbumModal onClose={() => setSuggesting(false)} />}
    </PageContainer>
  );
}

export default DropsPage;
