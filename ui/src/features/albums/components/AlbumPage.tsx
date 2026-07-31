import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAlbum } from "../api/albumApi";
import { ApiError } from "../../../lib/api-error";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Spinner from "../../../components/Spinner/Spinner";
import { FULL_DATE_FORMAT } from "../../../utils/date";
import { coverImageUrl } from "../../../utils/images";
import type { AlbumDetail } from "../types";
import styles from "./AlbumPage.module.css";
import AlbumActions from "./AlbumActions";
import ReviewsSection from "./ReviewsSection";
import SongsSection from "./SongsSection";

const DESCRIPTION_PREVIEW_LENGTH = 180;
const PRIMARY_GENRE_COUNT = 4;
const SECONDARY_GENRE_COUNT = 8;

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

function AlbumPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const id = Number(albumId);
  const invalidId = !Number.isFinite(id);

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getAlbum(id)
      .then((albumRes) => {
        if (cancelled) return;
        setAlbum(albumRes);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  function focusReviewInput() {
    commentInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    commentInputRef.current?.focus();
  }

  function handleReviewPosted() {
    getAlbum(id)
      .then(setAlbum)
      .catch(() => {});
  }

  function handleAlbumFavoriteChange(nextFavorited: boolean) {
    setAlbum((prev) =>
      prev
        ? {
            ...prev,
            favorited: nextFavorited,
            songs: prev.songs.map((song) => ({ ...song, favorited: nextFavorited })),
          }
        : prev,
    );
  }

  function handleSongFavoriteChange(songId: number, favorited: boolean) {
    setAlbum((prev) =>
      prev
        ? {
            ...prev,
            songs: prev.songs.map((song) =>
              song.id === songId ? { ...song, favorited } : song,
            ),
          }
        : prev,
    );
  }

  if (loading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <Spinner />
        </div>
      </section>
    );
  }

  if (notFound || !album) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <img
            src={missingResourcesIcon}
            alt=""
            className={styles.statusIcon}
          />
          <p>This album doesn't exist.</p>
        </div>
      </section>
    );
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
    <section className={styles.wrap}>
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
            albumId={id}
            favorited={album.favorited}
            onFavoriteChange={handleAlbumFavoriteChange}
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

      <SongsSection
        songs={album.songs}
        onSongFavoriteChange={handleSongFavoriteChange}
      />

      <ReviewsSection
        albumId={id}
        commentInputRef={commentInputRef}
        onReviewPosted={handleReviewPosted}
      />
    </section>
  );
}

export default AlbumPage;
