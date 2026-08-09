import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbum } from "../api/albumApi";
import { ApiError } from "../../../lib/api-error";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import type { AlbumArtist, AlbumDetail } from "../types";
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

  function handleGenresChange(genres: string[]) {
    setAlbum((prev) => (prev ? { ...prev, genres } : prev));
  }

  function handleTitleChange(title: string) {
    setAlbum((prev) => (prev ? { ...prev, title } : prev));
  }

  function handleReleaseDateChange(releaseDate: string) {
    setAlbum((prev) => (prev ? { ...prev, releaseDate } : prev));
  }

  function handleArtistsChange(artists: AlbumArtist[]) {
    setAlbum((prev) => (prev ? { ...prev, artists } : prev));
  }

  function handleSongsChange(songs: AlbumDetail["songs"]) {
    setAlbum((prev) => (prev ? { ...prev, songs } : prev));
  }

  if (loading) {
    return (
      <PageContainer>
        <PageStatus variant="loading" />
      </PageContainer>
    );
  }

  if (notFound || !album) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This album doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AlbumCard
        album={album}
        commentInputRef={commentInputRef}
        onAlbumFavoriteChange={handleAlbumFavoriteChange}
        onDescriptionChange={handleDescriptionChange}
        onCoverChange={handleCoverChange}
        onGenresChange={handleGenresChange}
        onTitleChange={handleTitleChange}
        onReleaseDateChange={handleReleaseDateChange}
        onArtistsChange={handleArtistsChange}
      />

      <SongsSection
        albumId={id}
        songs={album.songs}
        onSongFavoriteChange={handleSongFavoriteChange}
        onSongsChange={handleSongsChange}
      />

      <ReviewsSection
        albumId={id}
        commentInputRef={commentInputRef}
        onReviewPosted={handleReviewPosted}
      />
    </PageContainer>
  );
}

export default AlbumPage;
