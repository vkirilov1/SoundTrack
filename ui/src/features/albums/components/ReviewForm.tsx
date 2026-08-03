import { useState, type RefObject } from "react";
import type { SubmitEvent } from "react";
import { ApiError } from "../../../lib/api-error";
import type { AlbumReview, CreateAlbumReviewRequest } from "../types";
import RatingPicker from "./RatingPicker";
import styles from "./ReviewForm.module.css";

const MIN_COMMENT_LENGTH = 200;

interface ReviewFormProps {
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  /** Pre-fills the form when editing an existing review; omitted for a new one. */
  initialReview?: AlbumReview | null;
  isEditing: boolean;
  onSubmit: (payload: CreateAlbumReviewRequest) => Promise<AlbumReview>;
  onSaved: (review: AlbumReview) => void;
  onCancel?: () => void;
}

function ReviewForm({
  commentInputRef,
  initialReview,
  isEditing,
  onSubmit,
  onSaved,
  onCancel,
}: ReviewFormProps) {
  const [title, setTitle] = useState(initialReview?.title ?? "");
  const [rating, setRating] = useState<number | null>(
    initialReview?.rating ?? null,
  );
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
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

    try {
      const saved = await onSubmit({
        rating,
        title: trimmedTitle,
        comment: trimmedComment,
      });
      onSaved(saved);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't post your review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const commentLength = comment.trim().length;

  return (
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
        {isEditing && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
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
          {submitting ? "Posting…" : isEditing ? "Save" : "Post"}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
