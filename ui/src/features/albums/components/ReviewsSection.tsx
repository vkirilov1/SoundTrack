import { useEffect, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  createAlbumReview,
  deleteAlbumReview,
  getAlbumReviews,
  getMyReview,
  updateAlbumReview,
} from "../api/reviewApi";
import { ApiError } from "../../../lib/api-error";
import Pagination from "../../../components/Pagination/Pagination";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../../features/auth/stores/useAuth";
import type { AlbumReview } from "../types";
import styles from "./ReviewsSection.module.css";
import ReviewBody from "./ReviewBody";

const MIN_COMMENT_LENGTH = 200;

interface ReviewsSectionProps {
  albumId: number;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onReviewPosted: () => void;
}

interface RatingPickerProps {
  value: number | null;
  onChange: (value: number) => void;
}

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function RatingPicker({ value, onChange }: RatingPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <div
      className={styles.ratingPicker}
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(null)}
    >
      <button
        type="button"
        className={
          value === 0
            ? `${styles.zeroButton} ${styles.zeroActive}`
            : styles.zeroButton
        }
        aria-label="0 out of 5 stars"
        onMouseEnter={() => setHovered(0)}
        onClick={() => onChange(0)}
      >
        0
      </button>
      {[1, 2, 3, 4, 5].map((star) => {
        const fraction = Math.min(1, Math.max(0, shown - (star - 1)));
        return (
          <span key={star} className={styles.starWrap}>
            <svg
              viewBox="0 0 24 24"
              width={22}
              height={22}
              className={styles.starBg}
            >
              <path d={STAR_PATH} fill="var(--color-star-empty)" />
            </svg>
            <span
              className={styles.starClip}
              style={{ width: `${fraction * 100}%` }}
            >
              <svg viewBox="0 0 24 24" width={22} height={22}>
                <path d={STAR_PATH} fill="var(--color-star)" />
              </svg>
            </span>
            <button
              type="button"
              className={styles.starHalf}
              style={{ left: 0 }}
              aria-label={`${star - 0.5} out of 5 stars`}
              onMouseEnter={() => setHovered(star - 0.5)}
              onClick={() => onChange(star - 0.5)}
            />
            <button
              type="button"
              className={styles.starHalf}
              style={{ right: 0 }}
              aria-label={`${star} out of 5 stars`}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
            />
          </span>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ReviewsSection({
  albumId,
  commentInputRef,
  onReviewPosted,
}: ReviewsSectionProps) {
  const { user: currentUser } = useAuth();

  const [reviews, setReviews] = useState<AlbumReview[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const [myReview, setMyReview] = useState<AlbumReview | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAlbumReviews(albumId)
      .then((res) => {
        if (cancelled) return;
        setReviews(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [albumId]);

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

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setListLoading(true);
    getAlbumReviews(albumId, nextPage)
      .then((res) => {
        setReviews(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setListLoading(false));
  };

  function startEditing() {
    if (!myReview) return;
    setTitle(myReview.title);
    setRating(myReview.rating);
    setComment(myReview.comment);
    setFormError(null);
    setIsEditingMyReview(true);
  }

  function cancelEditing() {
    setIsEditingMyReview(false);
    setFormError(null);
  }

  function handleDelete() {
    if (!myReview) return;
    setDeleting(true);
    deleteAlbumReview(albumId, myReview.id)
      .then(() => {
        setMyReview(null);
        setConfirmingDelete(false);
        setTitle("");
        setRating(null);
        setComment("");
        return getAlbumReviews(albumId, 0);
      })
      .then((res) => {
        setReviews(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
        onReviewPosted();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (rating === null) {
      setFormError("Pick a rating from 0 to 5 stars.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedComment = comment.trim();

    if (!trimmedTitle || !trimmedComment) {
      setFormError("Title and comment can't be empty.");
      return;
    }
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      setFormError(
        `Comment must be at least ${MIN_COMMENT_LENGTH} characters (currently ${trimmedComment.length}).`,
      );
      return;
    }

    setSubmitting(true);

    const payload = { rating, title: trimmedTitle, comment: trimmedComment };
    const request =
      myReview && isEditingMyReview
        ? updateAlbumReview(albumId, myReview.id, payload)
        : createAlbumReview(albumId, payload);

    request
      .then((savedReview) => {
        setMyReview(savedReview);
        setIsEditingMyReview(false);
        setTitle("");
        setRating(null);
        setComment("");
        return getAlbumReviews(albumId, 0);
      })
      .then((res) => {
        setReviews(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
        onReviewPosted();
      })
      .catch((error: unknown) => {
        setFormError(
          error instanceof ApiError
            ? error.message
            : "Couldn't post your review.",
        );
      })
      .finally(() => setSubmitting(false));
  };

  const otherReviews = myReview
    ? reviews.filter((review) => review.id !== myReview.id)
    : reviews;

  const commentLength = comment.trim().length;

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
      ) : myReviewLoading ? (
        <div className={styles.myReviewLoading}>
          <Spinner size={20} label="Loading your review" />
        </div>
      ) : myReview && !isEditingMyReview ? (
        <div className={styles.myReviewCard}>
          <ReviewBody review={myReview} />
          <div className={styles.myReviewActions}>
            {confirmingDelete ? (
              <>
                <span className={styles.confirmText}>Delete this review?</span>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.confirmDeleteIconButton}`}
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Confirm delete"
                  title="Confirm delete"
                >
                  {deleting ? (
                    <Spinner size={14} label="Deleting" />
                  ) : (
                    <CheckIcon />
                  )}
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.cancelDeleteIconButton}`}
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  aria-label="Cancel delete"
                  title="Cancel"
                >
                  <XIcon />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={startEditing}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <form className={styles.composeForm} onSubmit={handleSubmit}>
          <div className={styles.composeRow}>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="Title"
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
            />
            <RatingPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            ref={commentInputRef}
            className={styles.commentInput}
            placeholder="Drop a thought..."
            value={comment}
            maxLength={3400}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className={styles.commentMeta}>
            <span
              className={
                commentLength < MIN_COMMENT_LENGTH
                  ? styles.charCountShort
                  : styles.charCount
              }
            >
              {commentLength}/{MIN_COMMENT_LENGTH} minimum
            </span>
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <div className={styles.composeFooter}>
            {isEditingMyReview && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={cancelEditing}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={styles.postButton}
              disabled={submitting}
            >
              {submitting ? "Posting…" : isEditingMyReview ? "Save" : "Post"}
            </button>
          </div>
        </form>
      )}

      <div className={styles.listWrap}>
        <div
          className={
            listLoading ? `${styles.list} ${styles.blurred}` : styles.list
          }
        >
          {loading ? (
            <div className={styles.loadingRow}>
              <Spinner label="Loading reviews" />
            </div>
          ) : (
            otherReviews.map((review) => (
              <article key={review.id} className={styles.reviewRow}>
                <ReviewBody review={review} />
              </article>
            ))
          )}
        </div>
        {listLoading && (
          <div className={styles.loadingOverlay}>
            <Spinner label="Loading reviews" />
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

export default ReviewsSection;
