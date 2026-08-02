import { useState } from "react";
import { Link } from "react-router-dom";
import {
  addFavoriteAlbum,
  removeFavoriteAlbum,
} from "../../albums/api/favoriteApi";
import { useAddToListMenu } from "../../albums/hooks/useAddToListMenu";
import AddToListMenu from "../../albums/components/AddToListMenu";
import HeartIcon from "../../../components/HeartIcon/HeartIcon";
import { useAuth } from "../../auth/stores/useAuth";
import { coverImageUrl } from "../../../utils/images";
import type { ArtistAlbum } from "../types";
import styles from "./ArtistAlbumRow.module.css";

interface ArtistAlbumRowProps {
  album: ArtistAlbum;
  onFavoriteChange: (albumId: number, favorited: boolean) => void;
}

function CoverPlaceholder() {
  return (
    <span className={styles.coverPlaceholder} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width={38}
        height={38}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </span>
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
    <li className={styles.row}>
      {album.coverUrl ? (
        <img
          src={coverImageUrl(album.coverUrl)}
          alt=""
          className={styles.cover}
        />
      ) : (
        <CoverPlaceholder />
      )}

      <div className={styles.info}>
        <Link to={`/album/${album.id}`} className={styles.title}>
          {album.title}
        </Link>
        <span className={styles.year}>{year}</span>
      </div>

      {album.rating > 0 && (
        <span className={styles.rating}>{album.rating.toFixed(1)}</span>
      )}

      {currentUser && (
        <>
          <button
            type="button"
            className={styles.heartButton}
            onClick={handleToggleFavorite}
            disabled={favoritePending}
            aria-pressed={album.favorited}
            aria-label={
              album.favorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <HeartIcon filled={album.favorited} size={18} />
          </button>

          <div className={styles.menuWrap} ref={menuRef}>
            <button
              type="button"
              className={styles.addButton}
              onClick={openMenu}
              aria-haspopup="true"
              aria-label="Add to list"
            >
              <PlusIcon />
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
        </>
      )}
    </li>
  );
}

export default ArtistAlbumRow;
