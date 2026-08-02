import { Link } from "react-router-dom";
import { FULL_DATE_FORMAT } from "../../../utils/date";
import styles from "./AlbumCard.module.css";
import AlbumActions from "./AlbumActions";
import { coverImageUrl } from "../../../utils/images";
import { useState, type RefObject } from "react";
import type { AlbumDetail } from "../types";

const DESCRIPTION_PREVIEW_LENGTH = 180;
const PRIMARY_GENRE_COUNT = 4;
const SECONDARY_GENRE_COUNT = 8;

interface AlbumCardProps {
  album: AlbumDetail;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onAlbumFavoriteChange: (nextFavorited: boolean) => void;
}

function AlbumCover({
  coverUrl,
  title,
}: {
  coverUrl: string | null;
  title: string;
}) {
  if (coverUrl) {
    return (
      <img src={coverImageUrl(coverUrl)} alt={title} className={styles.cover} />
    );
  }

  return (
    <span className={styles.coverPlaceholder} aria-hidden="true">
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
  );
}

function AlbumCard({
  album,
  commentInputRef,
  onAlbumFavoriteChange,
}: AlbumCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  function focusReviewInput() {
    commentInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    commentInputRef.current?.focus();
  }

  const primaryGenres = album.genres.slice(0, PRIMARY_GENRE_COUNT);
  const secondaryGenres = album.genres.slice(
    PRIMARY_GENRE_COUNT,
    PRIMARY_GENRE_COUNT + SECONDARY_GENRE_COUNT,
  );

  const description = album.description?.trim() || null;
  const showReadMore =
    description !== null && description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionText =
    description && showReadMore && !descriptionExpanded
      ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
      : description;

  return (
    <div className={styles.card}>
      <AlbumCover coverUrl={album.coverUrl} title={album.title} />

      <div className={styles.info}>
        <h1 className={styles.title}>{album.title}</h1>

        <p className={styles.artists}>
          {album.artists.map((artist, index) => (
            <span key={artist.id}>
              {index > 0 && ", "}
              <Link to={`/artist/${artist.id}`} className={styles.artistLink}>
                {artist.name}
              </Link>
            </span>
          ))}
        </p>

        <p className={styles.releaseDate}>
          {FULL_DATE_FORMAT.format(new Date(album.releaseDate))}
        </p>

        {album.genres.length > 0 && (
          <div className={styles.genres}>
            <div className={styles.genreRow}>
              {primaryGenres.map((genre) => (
                <span key={genre} className={styles.genrePill}>
                  {genre}
                </span>
              ))}
            </div>
            {secondaryGenres.length > 0 && (
              <div className={styles.genreRow}>
                {secondaryGenres.map((genre) => (
                  <span key={genre} className={styles.genrePillSmall}>
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {album.reviewsCount === 0 ? (
          <p className={styles.noReviews}>
            No reviews yet, be the{" "}
            <button
              type="button"
              className={styles.noReviewsLink}
              onClick={focusReviewInput}
            >
              first
            </button>
          </p>
        ) : (
          <p className={styles.rating}>
            <span className={styles.ratingValue}>
              {album.rating.toFixed(2)}/5
            </span>
            <span className={styles.ratingMeta}>
              {" "}
              based on {album.reviewsCount}{" "}
              {album.reviewsCount === 1 ? "review" : "reviews"}
            </span>
          </p>
        )}

        <AlbumActions
          albumId={album.id}
          favorited={album.favorited}
          onFavoriteChange={onAlbumFavoriteChange}
        />

        <div className={styles.description}>
          {description ? (
            <>
              <p className={styles.descriptionText}>{descriptionText}</p>
              {showReadMore && (
                <button
                  type="button"
                  className={styles.readMoreButton}
                  onClick={() =>
                    setDescriptionExpanded((expanded) => !expanded)
                  }
                >
                  {descriptionExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </>
          ) : (
            <p className={styles.descriptionEmpty}>No description yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlbumCard;
