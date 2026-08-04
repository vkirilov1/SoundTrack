import { useState } from "react";
import { Box, chakra, HStack } from "@chakra-ui/react";
import { addFavoriteAlbum, removeFavoriteAlbum } from "../api/favoriteApi";
import { useAddToListMenu } from "../hooks/useAddToListMenu";
import HeartIcon from "../../../components/icons/HeartIcon";
import { useAuth } from "../../../features/auth/stores/useAuth";
import AddToListMenu from "./AddToListMenu";

interface AlbumActionsProps {
  albumId: number;
  favorited: boolean;
  onFavoriteChange: (favorited: boolean) => void;
}

const pillButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "text",
  bg: "none",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "full",
  px: "16px",
  py: "8px",
  cursor: "pointer",
  transition:
    "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
} as const;

function AlbumActions({
  albumId,
  favorited,
  onFavoriteChange,
}: AlbumActionsProps) {
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
  } = useAddToListMenu(albumId);

  function handleToggleFavorite() {
    if (favoritePending) return;

    const next = !favorited;
    setFavoritePending(true);
    onFavoriteChange(next);

    const request = next
      ? addFavoriteAlbum(albumId)
      : removeFavoriteAlbum(albumId);

    request
      .catch(() => onFavoriteChange(!next))
      .finally(() => setFavoritePending(false));
  }

  if (!currentUser || currentUser.role === "ADMIN") return null;

  return (
    <HStack mt="18px" align="center" gap="10px">
      <chakra.button
        type="button"
        onClick={handleToggleFavorite}
        disabled={favoritePending}
        aria-pressed={favorited}
        {...pillButtonStyle}
        {...(favorited && { color: "favorite", borderColor: "favorite" })}
        _hover={
          favoritePending
            ? undefined
            : { borderColor: "favorite", color: "favorite" }
        }
        _disabled={{ opacity: 0.7, cursor: "default" }}
      >
        <HeartIcon filled={favorited} />
        {favorited ? "Favorited" : "Favorite"}
      </chakra.button>

      <Box position="relative" ref={menuRef}>
        <chakra.button
          type="button"
          onClick={openMenu}
          {...pillButtonStyle}
          _hover={{ bg: "border", color: "ink" }}
        >
          + Add to list
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
    </HStack>
  );
}

export default AlbumActions;
