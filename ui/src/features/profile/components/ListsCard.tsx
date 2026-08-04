import { useCallback, useEffect, useState } from "react";
import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import {
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
  getUserLists,
} from "../api/profileApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import HeartIcon from "../../../components/icons/HeartIcon";
import { usePagedList } from "../../../hooks/usePagedList";
import { coverImageUrl } from "../../../utils/images";

interface ListsCardProps {
  userId: number;
}

interface ListIconProps {
  coverUrl?: string | null;
  isFavorites?: boolean;
}

function ListIcon({ coverUrl, isFavorites }: ListIconProps) {
  if (isFavorites) {
    return (
      <Box
        flexShrink="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize="90px"
        borderRadius="md"
      >
        <HeartIcon filled size={42} />
      </Box>
    );
  }

  if (coverUrl) {
    return (
      <Image
        src={coverImageUrl(coverUrl)}
        alt=""
        flexShrink="0"
        boxSize="90px"
        borderRadius="md"
        objectFit="cover"
        bg="border"
      />
    );
  }

  return (
    <Box
      flexShrink="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="90px"
      border="1.5px solid"
      borderColor="ink"
      borderRadius="md"
      color="ink"
      opacity="0.55"
    >
      <ImagePlaceholderIcon size={26} />
    </Box>
  );
}

function ListsCard({ userId }: ListsCardProps) {
  const invalidId = !Number.isFinite(userId);

  const fetchLists = useCallback(
    (page: number) => getUserLists(userId, page),
    [userId],
  );
  const {
    items: lists,
    page: listsPage,
    totalPages: listsTotalPages,
    loading: listsLoading,
    listLoading,
    goToPage,
  } = usePagedList(fetchLists, { enabled: !invalidId });

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritesLoading, setFavoritesLoading] = useState(() => !invalidId);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    Promise.all([getUserFavoriteAlbums(userId), getUserFavoriteSongs(userId)])
      .then(([favoriteAlbumsRes, favoriteSongsRes]) => {
        if (cancelled) return;
        setFavoritesCount(
          favoriteAlbumsRes.totalElements + favoriteSongsRes.totalElements,
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFavoritesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, invalidId]);

  const showFavorites = listsPage === 0;
  const rowStyle = {
    gap: "16px",
    pb: "20px",
    borderBottom: "1px solid",
    borderColor: "border",
    _last: { pb: 0, borderBottom: "none" },
  } as const;

  return (
    <>
      <PagedSection
        loading={listsLoading || favoritesLoading}
        listLoading={listLoading}
        isEmpty={!showFavorites && lists.length === 0}
        emptyMessage="No lists yet."
        spinnerLabel="Loading lists"
      >
        <VStack
          as="ul"
          listStyle="none"
          m="0"
          mt="16px"
          p="0"
          gap="20px"
          align="stretch"
        >
          {showFavorites && (
            <HStack as="li" {...rowStyle}>
              <ListIcon isFavorites />
              <VStack flex="1" minW="0" gap="2px" align="stretch">
                <Text as="span" color="accent">
                  Favorites
                </Text>
              </VStack>
              <Text
                as="span"
                flexShrink="0"
                fontSize="13px"
                color="text"
                opacity="0.7"
              >
                {favoritesCount} {favoritesCount === 1 ? "item" : "items"}
              </Text>
            </HStack>
          )}
          {lists.map((list) => (
            <HStack as="li" key={list.id} {...rowStyle}>
              <ListIcon coverUrl={list.coverUrl} />
              <VStack flex="1" minW="0" gap="2px" align="stretch">
                <Text
                  as="span"
                  minW="0"
                  fontSize="17px"
                  fontWeight="600"
                  color="ink"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {list.name}
                </Text>
                {list.description && (
                  <Text
                    as="span"
                    minW="0"
                    fontSize="14px"
                    color="text"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {list.description}
                  </Text>
                )}
              </VStack>
              <Text
                as="span"
                flexShrink="0"
                fontSize="13px"
                color="text"
                opacity="0.7"
              >
                {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
              </Text>
            </HStack>
          ))}
        </VStack>
      </PagedSection>
      <Pagination
        page={listsPage}
        totalPages={listsTotalPages}
        onPageChange={goToPage}
      />
    </>
  );
}

export default ListsCard;
