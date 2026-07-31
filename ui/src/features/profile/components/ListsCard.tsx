import { useEffect, useState } from "react";
import {
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
  getUserLists,
} from "../api/profileApi";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Pagination from "../../../components/Pagination/Pagination";
import Spinner from "../../../components/Spinner/Spinner";
import { coverImageUrl } from "../../../utils/images";
import type { UserListSummary } from "../../../types/list";
import styles from "./ProfilePage.module.css";

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
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
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

function ListsCard({ userId }: ListsCardProps) {
  const invalidId = !Number.isFinite(userId);

  const [lists, setLists] = useState<UserListSummary[]>([]);
  const [listsPage, setListsPage] = useState(0);
  const [listsTotalPages, setListsTotalPages] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(() => !invalidId);
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    Promise.all([
      getUserLists(userId),
      getUserFavoriteAlbums(userId),
      getUserFavoriteSongs(userId),
    ])
      .then(([listsRes, favoriteAlbumsRes, favoriteSongsRes]) => {
        if (cancelled) return;
        setLists(listsRes.content);
        setListsPage(listsRes.page);
        setListsTotalPages(listsRes.totalPages);
        setFavoritesCount(
          favoriteAlbumsRes.totalElements + favoriteSongsRes.totalElements,
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, invalidId]);

  const handlePageChange = (page: number) => {
    if (page === listsPage) return;
    setListsLoading(true);
    getUserLists(userId, page)
      .then((listsRes) => {
        setLists(listsRes.content);
        setListsPage(listsRes.page);
        setListsTotalPages(listsRes.totalPages);
      })
      .catch(() => {})
      .finally(() => setListsLoading(false));
  };

  const showFavorites = listsPage === 0;

  return (
    <>
      <div className={styles.sectionWrap}>
        <div
          className={
            listsLoading
              ? `${styles.sectionContent} ${styles.blurred}`
              : styles.sectionContent
          }
        >
          {loading ? (
            <div className={styles.empty}>
              <Spinner label="Loading lists" />
            </div>
          ) : !showFavorites && lists.length === 0 ? (
            <div className={styles.empty}>
              <img
                src={missingResourcesIcon}
                alt=""
                className={styles.emptyIcon}
              />
              <p>No lists yet.</p>
            </div>
          ) : (
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
          )}
        </div>
        {listsLoading && (
          <div className={styles.loadingOverlay}>
            <Spinner label="Loading lists" />
          </div>
        )}
      </div>
      <Pagination
        page={listsPage}
        totalPages={listsTotalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default ListsCard;
