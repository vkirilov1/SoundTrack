import type { UserReview } from "../../../types/profile";
import styles from "../Profile.module.css";
import StarRating from "../../../components/StarRating/StarRating";

interface ReviewCardProps {
  reviews: UserReview[];
}

function ReviewCard({ reviews }: ReviewCardProps) {
  return (
    <ul className={styles.reviewRows}>
      {reviews.map((review) => (
        <li key={review.id} className={styles.reviewRow}>
          <div className={styles.reviewHeader}>
            <span className={styles.reviewTitle}>{review.title}</span>
            <StarRating rating={review.rating} />
          </div>
          <span className={styles.reviewAlbum}>{review.albumTitle}</span>
          <p className={styles.reviewComment}>{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewCard;
