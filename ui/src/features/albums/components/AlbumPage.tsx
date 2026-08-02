import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbum } from "../api/albumApi";
import { ApiError } from "../../../lib/api-error";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Spinner from "../../../components/Spinner/Spinner";
import type { AlbumDetail } from "../types";
import styles from "./AlbumPage.module.css";
import ReviewsSection from "./ReviewsSection";
import SongsSection from "./SongsSection";
import AlbumCard from "./AlbumCard";

function AlbumPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const id = Number(albumId);
  const invalidId = !Number.isFinite(id);

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);
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
            songs: prev.songs.map((song) => ({
              ...song,
              favorited: nextFavorited,
            })),
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

  function handleDescriptionChange(description: string | null) {
    setAlbum((prev) => (prev ? { ...prev, description } : prev));
  }

  function handleCoverChange(coverUrl: string | null) {
    setAlbum((prev) => (prev ? { ...prev, coverUrl } : prev));
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

  return (
    <section className={styles.wrap}>
      <AlbumCard
        album={album}
        commentInputRef={commentInputRef}
        onAlbumFavoriteChange={handleAlbumFavoriteChange}
        onDescriptionChange={handleDescriptionChange}
        onCoverChange={handleCoverChange}
      />

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
