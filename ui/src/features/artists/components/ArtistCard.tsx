import type { ArtistDetail } from "../types";
import { artistImageUrl } from "../../../utils/images";
import styles from "./ArtistCard.module.css";

interface ArtistCardProps {
  artist: ArtistDetail;
}

function ArtistCard({ artist }: ArtistCardProps) {
  const meta = [artist.type, artist.country].filter(Boolean).join(", ");
  const biography = artist.biography?.trim() || null;

  return (
    <div className={styles.card}>
      {artist.artistPic ? (
        <img
          src={artistImageUrl(artist.artistPic)}
          alt={artist.name}
          className={styles.photo}
        />
      ) : (
        <span className={styles.photoPlaceholder} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width={64}
            height={64}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </span>
      )}

      <h1 className={styles.name}>{artist.name}</h1>

      {meta && <p className={styles.meta}>{meta}</p>}

      <p className={styles.bio}>{biography ?? "No description yet."}</p>
    </div>
  );
}

export default ArtistCard;
