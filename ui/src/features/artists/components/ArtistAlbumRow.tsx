import { useState } from "react";
import { Box, chakra, HStack, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  addFavoriteAlbum,
  removeFavoriteAlbum,
} from "../../albums/api/favoriteApi";
import { useAddToListMenu } from "../../albums/hooks/useAddToListMenu";
import AddToListMenu from "../../albums/components/AddToListMenu";
import HeartToggleButton from "../../../components/HeartToggleButton/HeartToggleButton";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import { useAuth } from "../../auth/stores/useAuth";
import { coverImageUrl } from "../../../utils/images";
import type { ArtistAlbum } from "../types";

interface ArtistAlbumRowProps {
  album: ArtistAlbum;
  onFavoriteChange: (albumId: number, favorited: boolean) => void;
}

function CoverPlaceholder() {
  return (
    <Box
      as="span"
      aria-hidden="true"
      flexShrink="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="96px"
      border="1.5px solid"
      borderColor="border"
      borderRadius="md"
      color="text"
      opacity="0.55"
    >
      <ImagePlaceholderIcon size={38} />
    </Box>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArtistAlbumRow({ album, onFavoriteChange }: ArtistAlbumRowProps) {
  const { user: currentUser } = useAuth();
  const [favoritePending, setFavoritePending] = useState(false);

  const {
    menuOpen,
    lists,
    listsLoading,
    addStatus,
    newListName,
    setNewListName,
    creatingList,
    menuError,
    menuRef,
    openMenu,
    handleAddToList,
    handleCreateList,
  } = useAddToListMenu(album.id);

  function handleToggleFavorite() {
    if (favoritePending) return;

    const next = !album.favorited;
    setFavoritePending(true);
    onFavoriteChange(album.id, next);

    const request = next
      ? addFavoriteAlbum(album.id)
      : removeFavoriteAlbum(album.id);

    request
      .catch(() => onFavoriteChange(album.id, !next))
      .finally(() => setFavoritePending(false));
  }

  const year = new Date(album.releaseDate).getFullYear();

  return (
    <HStack
      as="li"
      gap="20px"
      py="18px"
      px="4px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
    >
      {album.coverUrl ? (
        <Image
          src={coverImageUrl(album.coverUrl)}
          alt=""
          flexShrink="0"
          boxSize="96px"
          borderRadius="md"
          objectFit="cover"
          bg="border"
        />
      ) : (
        <CoverPlaceholder />
      )}

      <Box
        flex="1"
        minW="0"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="4px"
      >
        <Link
          asChild
          maxW="100%"
          fontSize="19px"
          fontWeight="600"
          color="ink"
          textDecoration="none"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          _hover={{ color: "accentHover" }}
        >
          <RouterLink to={`/album/${album.id}`}>{album.title}</RouterLink>
        </Link>
        <Text fontSize="14px" color="text" opacity="0.7">
          {year}
        </Text>
      </Box>

      {album.rating > 0 && (
        <Text flexShrink="0" fontSize="17px" fontWeight="700" color="accent">
          {album.rating.toFixed(1)}
        </Text>
      )}

      {currentUser && currentUser.role !== "ADMIN" && (
        <>
          <HeartToggleButton
            filled={album.favorited}
            onClick={handleToggleFavorite}
            disabled={favoritePending}
          />

          <Box position="relative" flexShrink="0" ref={menuRef}>
            <chakra.button
              type="button"
              onClick={openMenu}
              aria-haspopup="true"
              aria-label="Add to list"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w="30px"
              h="30px"
              bg="none"
              border="1px solid"
              borderColor="border"
              borderRadius="full"
              color="text"
              cursor="pointer"
              transition="background 0.15s ease, color 0.15s ease, border-color 0.15s ease"
              _hover={{ borderColor: "accent", color: "accent" }}
            >
              <PlusIcon />
            </chakra.button>

            {menuOpen && (
              <AddToListMenu
                lists={lists}
                listsLoading={listsLoading}
                addStatus={addStatus}
                menuError={menuError}
                newListName={newListName}
                onNewListNameChange={setNewListName}
                creatingList={creatingList}
                onAddToList={handleAddToList}
                onCreateList={handleCreateList}
              />
            )}
          </Box>
        </>
      )}
    </HStack>
  );
}

export default ArtistAlbumRow;
