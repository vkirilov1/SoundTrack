import { useState } from "react";
import styles from "./RatingPicker.module.css";

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

export default RatingPicker;
