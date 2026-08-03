import { useCallback } from "react";
import { getUserReviews } from "../api/profileApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import StarRating from "../../../components/StarRating/StarRating";
import { useAuth } from "../../auth/stores/useAuth";
import { usePagedList } from "../../../hooks/usePagedList";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import styles from "./ReviewsCard.module.css";
import { Link } from "react-router-dom";
import AdminReviewDeleteControl from "../../edit-requests/components/AdminReviewDeleteControl";

interface ReviewsCardProps {
  userId: number;
}

function ReviewsCard({ userId }: ReviewsCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const invalidId = !Number.isFinite(userId);

  const fetchReviews = useCallback(
    (page: number) => getUserReviews(userId, page),
    [userId],
  );
  const {
    items: reviews,
    setItems: setReviews,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchReviews, { enabled: !invalidId });

  function handleAdminReviewDeleted(reviewId: number) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={reviews.length === 0}
        emptyMessage="No reviews yet."
        spinnerLabel="Loading reviews"
      >
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
                <Link to={`/album/${review.albumId}`}>{review.albumTitle}</Link>
              </span>
              <p className={styles.reviewComment}>{review.comment}</p>
              {isAdmin && (
                <div className={styles.adminReviewActions}>
                  <AdminReviewDeleteControl
                    reviewId={review.id}
                    onDeleted={handleAdminReviewDeleted}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default ReviewsCard;
