import { useState } from "react";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import type { AlbumReview } from "../types";
import ReviewBody from "./ReviewBody";
import styles from "./MyReviewCard.module.css";

interface MyReviewCardProps {
  review: AlbumReview;
  onEdit: () => void;
  onDelete: () => Promise<unknown>;
}

function MyReviewCard({ review, onEdit, onDelete }: MyReviewCardProps) {
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "confirming" | "deleting"
  >("idle");

  return (
    <div className={styles.myReviewCard}>
      <ReviewBody review={review} />
      <div className={styles.myReviewActions}>
        {deleteStatus === "idle" && (
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Edit
          </button>
        )}
        <ConfirmDeleteControl
          confirmMessage="Delete this review?"
          onDelete={onDelete}
          onStatusChange={setDeleteStatus}
        />
      </div>
    </div>
  );
}

export default MyReviewCard;
