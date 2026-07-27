import styles from "./StarRating.module.css";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

interface StarRatingProps {
  rating: number;
  size?: number;
}

function StarRating({ rating, size = 16 }: StarRatingProps) {
  const fractions = [0, 1, 2, 3, 4].map((i) =>
    Math.min(1, Math.max(0, rating - i)),
  );

  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {fractions.map((fraction, index) => (
        <span
          key={index}
          className={styles.star}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={styles.starBg}
          >
            <path d={STAR_PATH} />
          </svg>
          <span
            className={styles.starClip}
            style={{ width: `${fraction * 100}%` }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              className={styles.starFg}
            >
              <path d={STAR_PATH} />
            </svg>
          </span>
        </span>
      ))}
    </span>
  );
}

export default StarRating;
