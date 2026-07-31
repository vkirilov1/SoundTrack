import { useEffect, useRef, useState } from "react";
import { addFavoriteAlbum, removeFavoriteAlbum } from "../api/favoriteApi";
import { addAlbumToList, createList, getMyLists } from "../api/listApi";
import { ApiError } from "../../../lib/api-error";
import HeartIcon from "../../../components/HeartIcon/HeartIcon";
import { useAuth } from "../../../features/auth/stores/useAuth";
import type { UserListSummary } from "../../../types/list";
import styles from "./AlbumActions.module.css";

interface AlbumActionsProps {
  albumId: number;
  favorited: boolean;
  onFavoriteChange: (favorited: boolean) => void;
}

type AddStatus = "idle" | "adding" | "added" | "error";

function AlbumActions({ albumId, favorited, onFavoriteChange }: AlbumActionsProps) {
  const { user: currentUser } = useAuth();

  const [favoritePending, setFavoritePending] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [lists, setLists] = useState<UserListSummary[] | null>(null);
  const [listsLoading, setListsLoading] = useState(false);
  const [addStatus, setAddStatus] = useState<Record<number, AddStatus>>({});
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  function handleToggleFavorite() {
    if (favoritePending) return;

    const next = !favorited;
    setFavoritePending(true);
    onFavoriteChange(next);

    const request = next ? addFavoriteAlbum(albumId) : removeFavoriteAlbum(albumId);

    request
      .catch(() => onFavoriteChange(!next))
      .finally(() => setFavoritePending(false));
  }

  function openMenu() {
    setMenuOpen((open) => !open);
    if (lists === null && !listsLoading) {
      setListsLoading(true);
      setMenuError(null);
      getMyLists(0, 50, albumId)
        .then((res) => {
          setLists(res.content);
          // Lists that already contain this album can't be "added" to again - pre-seed
          // their status so the button renders disabled/"Added ✓" instead of offering an
          // action that would just 409.
          setAddStatus((prev) => {
            const next = { ...prev };
            res.content.forEach((list) => {
              if (list.containsAlbum) next[list.id] = "added";
            });
            return next;
          });
        })
        .catch(() => setMenuError("Couldn't load your lists."))
        .finally(() => setListsLoading(false));
    }
  }

  function handleAddToList(listId: number) {
    setAddStatus((prev) => ({ ...prev, [listId]: "adding" }));
    addAlbumToList(listId, albumId)
      .then(() => setAddStatus((prev) => ({ ...prev, [listId]: "added" })))
      .catch((error: unknown) => {
        setAddStatus((prev) => ({ ...prev, [listId]: "error" }));
        if (error instanceof ApiError && error.status === 409) {
          setAddStatus((prev) => ({ ...prev, [listId]: "added" }));
        }
      });
  }

  function handleCreateList(event: React.FormEvent) {
    event.preventDefault();
    const name = newListName.trim();
    if (!name || creatingList) return;

    setCreatingList(true);
    setMenuError(null);

    createList(name)
      .then((created) => {
        setLists((prev) => [
          {
            id: created.id,
            name: created.name,
            description: null,
            itemCount: 0,
            coverUrl: null,
            containsAlbum: false,
          },
          ...(prev ?? []),
        ]);
        setNewListName("");
        handleAddToList(created.id);
      })
      .catch(() => setMenuError("Couldn't create the list."))
      .finally(() => setCreatingList(false));
  }

  if (!currentUser) return null;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={favorited ? `${styles.favoriteButton} ${styles.active}` : styles.favoriteButton}
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
          <div className={styles.menu}>
            {listsLoading ? (
              <p className={styles.menuHint}>Loading your lists…</p>
            ) : lists && lists.length > 0 ? (
              <ul className={styles.menuList}>
                {lists.map((list) => {
                  const status = addStatus[list.id] ?? "idle";
                  return (
                    <li key={list.id}>
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => handleAddToList(list.id)}
                        disabled={status === "adding" || status === "added"}
                      >
                        <span>{list.name}</span>
                        <span className={styles.menuItemStatus}>
                          {status === "adding" ? "Adding…" : status === "added" ? "Added ✓" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.menuHint}>You don't have any lists yet.</p>
            )}

            {menuError && <p className={styles.menuError}>{menuError}</p>}

            <form className={styles.createForm} onSubmit={handleCreateList}>
              <input
                type="text"
                className={styles.createInput}
                placeholder="New list name"
                value={newListName}
                maxLength={255}
                onChange={(event) => setNewListName(event.target.value)}
              />
              <button
                type="submit"
                className={styles.createButton}
                disabled={creatingList || !newListName.trim()}
              >
                Create
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumActions;
