import { SHORT_DATE_FORMAT } from "../../../lib/date";
import { userPhotoUrl } from "../../../lib/images";
import styles from "./ReviewsSection.module.css";
import type { AlbumReview } from "../../../types/album";
import { Link } from "react-router-dom";

function ReviewerAvatar({
  profilePictureUrl,
}: {
  profilePictureUrl: string | null;
}) {
  return (
    <img
      src={userPhotoUrl(profilePictureUrl ?? "userDefault.png")}
      alt=""
      className={styles.reviewAvatar}
    />
  );
}

function ReviewBody({ review }: { review: AlbumReview }) {
  return (
    <>
      <div className={styles.reviewRowHeader}>
        <ReviewerAvatar profilePictureUrl={review.profilePictureUrl} />
        <span className={styles.reviewUsername}>
          <Link to={`/profile/${review.userId}`} className={styles.link}>
            {review.username}
          </Link>
        </span>
        <span className={styles.reviewDate}>
          {SHORT_DATE_FORMAT.format(new Date(review.createdAt))}
        </span>
      </div>
      <div className={styles.reviewTitleRow}>
        <span className={styles.reviewTitle}>{review.title}</span>
        <span className={styles.reviewRatingValue}>
          {review.rating.toFixed(1)}/5
        </span>
      </div>
      <p className={styles.reviewComment}>{review.comment}</p>
    </>
  );
}

export default ReviewBody;
