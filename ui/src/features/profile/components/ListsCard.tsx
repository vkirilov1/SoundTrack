import { useCallback, useEffect, useState } from "react";
import {
  Box,
  HStack,
  Image,
  Link,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
  getUserLists,
} from "../api/profileApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import HeartIcon from "../../../components/icons/HeartIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import { usePagedList } from "../../../hooks/usePagedList";
import { coverImageUrl } from "../../../utils/images";
import { useAuth } from "../../auth/stores/useAuth";
import CreateListModal from "../../lists/components/CreateListModal";

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
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;
  const [creating, setCreating] = useState(false);

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
    display: "flex",
    alignItems: "center",
    gap: "16px",
  } as const;
  const titleLinkStyle = {
    asChild: true,
    textDecoration: "none",
    _hover: { color: "accentHover" },
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
            <Box
              as="li"
              borderBottom={lists.length > 0 ? "1px solid" : "none"}
              borderColor="border"
              {...rowStyle}
            >
              <ListIcon isFavorites />
              <VStack flex="1" minW="0" gap="2px" align="stretch">
                <HStack>
                  <Link {...titleLinkStyle} color="accent">
                    <RouterLink to={`/profile/${userId}/favorites`}>
                      Favorites
                    </RouterLink>
                  </Link>
                </HStack>
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
            </Box>
          )}
          {lists.map((list) => (
            <Box as="li" key={list.id} {...rowStyle}>
              <ListIcon coverUrl={list.coverUrl} />
              <VStack flex="1" minW="0" gap="2px" align="stretch">
                <HStack>
                  <Link
                    {...titleLinkStyle}
                    color="ink"
                    fontWeight="600"
                    fontSize="17px"
                  >
                    <RouterLink
                      to={`/list/${list.id}`}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {list.name}
                    </RouterLink>
                  </Link>
                </HStack>
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
            </Box>
          ))}
        </VStack>

        {isOwnProfile && (
          <Box
            mt="20px"
            pt="20px"
            borderTop="1px solid"
            borderColor="border"
            textAlign="center"
          >
            <chakra.button
              type="button"
              onClick={() => setCreating(true)}
              aria-label="Create a list"
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
          </Box>
        )}
      </PagedSection>
      <Pagination
        page={listsPage}
        totalPages={listsTotalPages}
        onPageChange={goToPage}
      />

      {creating && <CreateListModal onClose={() => setCreating(false)} />}
    </>
  );
}

export default ListsCard;
