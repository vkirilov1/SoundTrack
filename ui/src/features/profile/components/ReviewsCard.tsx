import { useEffect, useState } from "react";
import { getUserReviews } from "../api/profileApi";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Pagination from "../../../components/Pagination/Pagination";
import Spinner from "../../../components/Spinner/Spinner";
import StarRating from "../../../components/StarRating/StarRating";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import type { UserReview } from "../types";
import styles from "./ProfilePage.module.css";
import { Link } from "react-router-dom";

interface ReviewsCardProps {
  userId: number;
}

function ReviewsCard({ userId }: ReviewsCardProps) {
  const invalidId = !Number.isFinite(userId);

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [loading, setLoading] = useState(() => !invalidId);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getUserReviews(userId)
      .then((reviewsRes) => {
        if (cancelled) return;
        setReviews(reviewsRes.content);
        setReviewsPage(reviewsRes.page);
        setReviewsTotalPages(reviewsRes.totalPages);
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
    if (page === reviewsPage) return;
    setReviewsLoading(true);
    getUserReviews(userId, page)
      .then((reviewsRes) => {
        setReviews(reviewsRes.content);
        setReviewsPage(reviewsRes.page);
        setReviewsTotalPages(reviewsRes.totalPages);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  return (
    <>
      <div className={styles.sectionWrap}>
        <div
          className={
            reviewsLoading
              ? `${styles.sectionContent} ${styles.blurred}`
              : styles.sectionContent
          }
        >
          {loading ? (
            <div className={styles.empty}>
              <Spinner label="Loading reviews" />
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.empty}>
              <img
                src={missingResourcesIcon}
                alt=""
                className={styles.emptyIcon}
              />
              <p>No reviews yet.</p>
            </div>
          ) : (
            <ul className={styles.reviewRows}>
              {reviews.map((review) => (
                <li key={review.id} className={styles.reviewRow}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewTitle}>{review.title}</span>
                    <div className={styles.reviewRating}>
                      <StarRating rating={review.rating} />
                      <span className={styles.reviewDate}>
                        {MONTH_YEAR_FORMAT.format(new Date(review.createdAt))}
                      </span>
                    </div>
                  </div>
                  <span className={styles.reviewAlbum}>
                    <Link to={`/album/${review.albumId}`}>
                      {review.albumTitle}
                    </Link>
                  </span>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </li>
              ))}
            </ul>
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
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default ReviewsCard;
