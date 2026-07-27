import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserFavoriteAlbums,
  getUserFavoriteSongs,
  getUserLists,
  getUserProfile,
  getUserReviews,
} from "../../api/profileApi";
import { ApiError } from "../../api/ApiError";
import Pagination from "../../components/Pagination/Pagination";
import Spinner from "../../components/Spinner/Spinner";
import { userPhotoUrl } from "../../lib/images";
import type { UserProfile } from "../../types/auth";
import type { UserListSummary, UserReview } from "../../types/profile";
import styles from "./Profile.module.css";
import ReviewCard from "./components/ReviewCard";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

interface ListRow {
  key: string;
  name: string;
  itemCount: number;
  isFavorites: boolean;
}

function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const invalidId = !Number.isFinite(id);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lists, setLists] = useState<UserListSummary[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    Promise.all([
      getUserProfile(id),
      getUserLists(id),
      getUserFavoriteAlbums(id),
      getUserFavoriteSongs(id),
      getUserReviews(id),
    ])
      .then(
        ([
          profileRes,
          listsRes,
          favoriteAlbumsRes,
          favoriteSongsRes,
          reviewsRes,
        ]) => {
          if (cancelled) return;
          setProfile(profileRes);
          setLists(listsRes.content);
          setFavoritesCount(
            favoriteAlbumsRes.totalElements + favoriteSongsRes.totalElements,
          );
          setReviews(reviewsRes.content);
          setReviewsPage(reviewsRes.page);
          setReviewsTotalPages(reviewsRes.totalPages);
          setNotFound(false);
        },
      )
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  const handleReviewsPageChange = (page: number) => {
    if (page === reviewsPage) return;
    setReviewsLoading(true);
    getUserReviews(id, page)
      .then((reviewsRes) => {
        setReviews(reviewsRes.content);
        setReviewsPage(reviewsRes.page);
        setReviewsTotalPages(reviewsRes.totalPages);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  if (loading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <Spinner />
        </div>
      </section>
    );
  }

  if (notFound || !profile) {
    return (
      <section className={styles.wrap}>
        <p className={styles.status}>This user doesn't exist.</p>
      </section>
    );
  }

  const listRows: ListRow[] = [
    ...(favoritesCount > 0
      ? [
          {
            key: "favorites",
            name: "Favorites",
            itemCount: favoritesCount,
            isFavorites: true,
          },
        ]
      : []),
    ...lists.map((list) => ({
      key: `list-${list.id}`,
      name: list.name,
      itemCount: list.itemCount,
      isFavorites: false,
    })),
  ];

  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <img
          src={userPhotoUrl(profile.profilePictureUrl ?? "userDefault.png")}
          alt={profile.username}
          className={styles.avatar}
        />
        <h1 className={styles.name}>{profile.username}</h1>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <p className={styles.joinDate}>
          Joined {DATE_FORMAT.format(new Date(profile.joinDate))}
        </p>
      </div>

      <div className={styles.sections}>
        <div className={styles.column}>
          <h2 className={styles.sectionHeading}>Lists</h2>
          {listRows.length === 0 ? (
            <p className={styles.empty}>No lists yet.</p>
          ) : (
            <ul className={styles.rows}>
              {listRows.map((row) => (
                <li key={row.key} className={styles.row}>
                  <span className={styles.bullet} aria-hidden="true">
                    ·
                  </span>
                  <span
                    className={
                      row.isFavorites ? styles.favoritesName : styles.rowName
                    }
                  >
                    {row.name}
                  </span>
                  <span className={styles.rowMeta}>
                    {row.itemCount} {row.itemCount === 1 ? "item" : "items"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.column}>
          <h2 className={styles.sectionHeading}>Reviews</h2>
          <div className={styles.reviewsWrap}>
            <div
              className={
                reviewsLoading
                  ? `${styles.reviewsContent} ${styles.blurred}`
                  : styles.reviewsContent
              }
            >
              {reviews.length === 0 ? (
                <p className={styles.empty}>No reviews yet.</p>
              ) : (
                <ReviewCard reviews={reviews} />
              )}
            </div>
            {reviewsLoading && (
              <div className={styles.loadingOverlay}>
                <Spinner label="Loading reviews" />
              </div>
            )}
          </div>
          <Pagination
            page={reviewsPage}
            totalPages={reviewsTotalPages}
            onPageChange={handleReviewsPageChange}
          />
        </div>
      </div>
    </section>
  );
}

export default Profile;
