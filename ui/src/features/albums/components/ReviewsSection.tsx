import { useCallback, useEffect, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  createAlbumReview,
  deleteAlbumReview,
  getAlbumReviews,
  getMyReview,
  updateAlbumReview,
} from "../api/reviewApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { usePagedList } from "../../../hooks/usePagedList";
import AdminReviewDeleteControl from "../../edit-requests/components/AdminReviewDeleteControl";
import type { AlbumReview } from "../types";
import styles from "./ReviewsSection.module.css";
import MyReviewCard from "./MyReviewCard";
import ReviewBody from "./ReviewBody";
import ReviewForm from "./ReviewForm";

interface ReviewsSectionProps {
  albumId: number;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onReviewPosted: () => void;
}

function ReviewsSection({
  albumId,
  commentInputRef,
  onReviewPosted,
}: ReviewsSectionProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const fetchReviews = useCallback(
    (page: number) => getAlbumReviews(albumId, page),
    [albumId],
  );
  const {
    items: reviews,
    setItems: setReviews,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
    reload,
  } = usePagedList(fetchReviews);

  const [myReview, setMyReview] = useState<AlbumReview | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    getMyReview(albumId)
      .then((review) => {
        if (cancelled) return;
        setMyReview(review);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMyReviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [albumId, currentUser]);

  function handleReviewSaved(saved: AlbumReview) {
    setMyReview(saved);
    setIsEditingMyReview(false);
    reload()
      .then(() => onReviewPosted())
      .catch(() => {});
  }

  function handleDeleteMyReview() {
    if (!myReview) return Promise.resolve();

    return deleteAlbumReview(albumId, myReview.id).then(() => {
      setMyReview(null);
      return reload().then(() => onReviewPosted());
    });
  }

  function handleAdminReviewDeleted(reviewId: number) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    onReviewPosted();
  }

  const otherReviews = myReview
    ? reviews.filter((review) => review.id !== myReview.id)
    : reviews;

  return (
    <section className={styles.wrap}>
      <h2 className={styles.heading}>Reviews</h2>

      {!currentUser ? (
        <p className={styles.loginPrompt}>
          <Link to="/login" className={styles.link}>
            Log in
          </Link>{" "}
          to write a review.
        </p>
      ) : isAdmin ? null : myReviewLoading ? (
        <div className={styles.myReviewLoading}>
          <Spinner size={20} label="Loading your review" />
        </div>
      ) : myReview && !isEditingMyReview ? (
        <MyReviewCard
          review={myReview}
          onEdit={() => setIsEditingMyReview(true)}
          onDelete={handleDeleteMyReview}
        />
      ) : (
        <ReviewForm
          commentInputRef={commentInputRef}
          initialReview={isEditingMyReview ? myReview : null}
          isEditing={isEditingMyReview}
          onSubmit={(payload) =>
            myReview && isEditingMyReview
              ? updateAlbumReview(albumId, myReview.id, payload)
              : createAlbumReview(albumId, payload)
          }
          onSaved={handleReviewSaved}
          onCancel={() => setIsEditingMyReview(false)}
        />
      )}

      {/* No emptyMessage here — AlbumCard already prompts to write the first review. */}
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={otherReviews.length === 0}
        spinnerLabel="Loading reviews"
      >
        <div className={styles.reviewList}>
          {otherReviews.map((review) => (
            <article key={review.id} className={styles.reviewRow}>
              <ReviewBody review={review} />
              {isAdmin && (
                <div className={styles.adminReviewActions}>
                  <AdminReviewDeleteControl
                    reviewId={review.id}
                    onDeleted={handleAdminReviewDeleted}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </PagedSection>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </section>
  );
}

export default ReviewsSection;
