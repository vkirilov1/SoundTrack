import { useCallback, useEffect, useState } from "react";
import {
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
  getUserLists,
} from "../api/profileApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import ImagePlaceholderIcon from "../../../components/ImagePlaceholderIcon/ImagePlaceholderIcon";
import { usePagedList } from "../../../hooks/usePagedList";
import { coverImageUrl } from "../../../utils/images";
import styles from "./ListsCard.module.css";

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
      <span className={styles.favoritesIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={42} height={42} fill="#e11d48">
          <g transform="translate(0 -1028.4)">
            <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" />
          </g>
        </svg>
      </span>
    );
  }

  if (coverUrl) {
    return (
      <img src={coverImageUrl(coverUrl)} alt="" className={styles.listCover} />
    );
  }

  return (
    <span className={styles.listIcon} aria-hidden="true">
      <ImagePlaceholderIcon size={26} />
    </span>
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

  return (
    <>
      <PagedSection
        loading={listsLoading || favoritesLoading}
        listLoading={listLoading}
        isEmpty={!showFavorites && lists.length === 0}
        emptyMessage="No lists yet."
        spinnerLabel="Loading lists"
      >
        <ul className={styles.listRows}>
          {showFavorites && (
            <li className={styles.listRow}>
              <ListIcon isFavorites />
              <div className={styles.listInfo}>
                <span className={styles.favoritesTitle}>Favorites</span>
              </div>
              <span className={styles.listMeta}>
                {favoritesCount} {favoritesCount === 1 ? "item" : "items"}
              </span>
            </li>
          )}
          {lists.map((list) => (
            <li key={list.id} className={styles.listRow}>
              <ListIcon coverUrl={list.coverUrl} />
              <div className={styles.listInfo}>
                <span className={styles.listTitle}>{list.name}</span>
                {list.description && (
                  <span className={styles.listDescription}>
                    {list.description}
                  </span>
                )}
              </div>
              <span className={styles.listMeta}>
                {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
              </span>
            </li>
          ))}
        </ul>
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
