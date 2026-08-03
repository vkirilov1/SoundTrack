import { Link } from "react-router-dom";
import { FULL_DATE_FORMAT } from "../../../utils/date";
import styles from "./AlbumCard.module.css";
import AlbumActions from "./AlbumActions";
import ImagePlaceholderIcon from "../../../components/ImagePlaceholderIcon/ImagePlaceholderIcon";
import { coverImageUrl } from "../../../utils/images";
import type { RefObject } from "react";
import type { AlbumDetail } from "../types";
import { useAuth } from "../../auth/stores/useAuth";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import EditableDescription from "../../edit-requests/components/EditableDescription";
import {
  updateAlbumDescription,
  uploadAlbumPhoto,
} from "../../edit-requests/api/adminContentApi";

const PRIMARY_GENRE_COUNT = 4;
const SECONDARY_GENRE_COUNT = 8;

interface AlbumCardProps {
  album: AlbumDetail;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onAlbumFavoriteChange: (nextFavorited: boolean) => void;
  onDescriptionChange: (description: string | null) => void;
  onCoverChange: (coverUrl: string | null) => void;
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
      <ImagePlaceholderIcon size={64} />
    </span>
  );
}

function AlbumCard({
  album,
  commentInputRef,
  onAlbumFavoriteChange,
  onDescriptionChange,
  onCoverChange,
}: AlbumCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  function focusReviewInput() {
    commentInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    commentInputRef.current?.focus();
  }

  async function handleSaveDescription(text: string) {
    const updated = await updateAlbumDescription(album.id, album.title, text);
    onDescriptionChange(updated.description);
  }

  async function handleSavePhoto(file: File) {
    const updated = await uploadAlbumPhoto(album.id, file);
    onCoverChange(updated.coverUrl);
  }

  const primaryGenres = album.genres.slice(0, PRIMARY_GENRE_COUNT);
  const secondaryGenres = album.genres.slice(
    PRIMARY_GENRE_COUNT,
    PRIMARY_GENRE_COUNT + SECONDARY_GENRE_COUNT,
  );

  return (
    <div className={styles.card}>
      <div className={styles.coverWrap}>
        <AlbumCover coverUrl={album.coverUrl} title={album.title} />
        {isAdmin && (
          <AdminPhotoEditButton
            onSavePhoto={handleSavePhoto}
            label="Change cover"
          />
        )}
      </div>

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
          <EditableDescription
            text={album.description}
            targetType="ALBUM"
            targetId={album.id}
            onSave={handleSaveDescription}
            classNames={{
              paragraph: styles.descriptionText,
              emptyParagraph: styles.descriptionEmpty,
              actions: styles.descriptionActions,
              readMoreButton: styles.readMoreButton,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AlbumCard;
