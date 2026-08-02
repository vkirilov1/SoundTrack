import { useState } from "react";
import { addFavoriteAlbum, removeFavoriteAlbum } from "../api/favoriteApi";
import { useAddToListMenu } from "../hooks/useAddToListMenu";
import HeartIcon from "../../../components/HeartIcon/HeartIcon";
import { useAuth } from "../../../features/auth/stores/useAuth";
import AddToListMenu from "./AddToListMenu";
import styles from "./AlbumActions.module.css";

interface AlbumActionsProps {
  albumId: number;
  favorited: boolean;
  onFavoriteChange: (favorited: boolean) => void;
}

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
    <div className={styles.wrap}>
      <button
        type="button"
        className={
          favorited
            ? `${styles.favoriteButton} ${styles.active}`
            : styles.favoriteButton
        }
        onClick={handleToggleFavorite}
        disabled={favoritePending}
        aria-pressed={favorited}
      >
        <HeartIcon filled={favorited} />
        {favorited ? "Favorited" : "Favorite"}
      </button>

      <div className={styles.menuWrap} ref={menuRef}>
        <button type="button" className={styles.listButton} onClick={openMenu}>
          + Add to list
        </button>

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
      </div>
    </div>
  );
}

export default AlbumActions;
