import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist } from "../api/artistApi";
import { ApiError } from "../../../lib/api-error";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import type { ArtistDetail } from "../types";
import ArtistAlbums from "./ArtistAlbums";
import ArtistCard from "./ArtistCard";

function ArtistPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const id = Number(artistId);
  const invalidId = !Number.isFinite(id);

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getArtist(id)
      .then((artistRes) => {
        if (cancelled) return;
        setArtist(artistRes);
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

  function handleAlbumFavoriteChange(albumId: number, favorited: boolean) {
    setArtist((prev) =>
      prev
        ? {
            ...prev,
            albums: prev.albums.map((album) =>
              album.id === albumId ? { ...album, favorited } : album,
            ),
          }
        : prev,
    );
  }

  function handleNameChange(name: string) {
    setArtist((prev) => (prev ? { ...prev, name } : prev));
  }

  function handleCountryChange(country: string | null) {
    setArtist((prev) => (prev ? { ...prev, country } : prev));
  }

  function handleTypeChange(type: string | null) {
    setArtist((prev) => (prev ? { ...prev, type } : prev));
  }

  function handleBiographyChange(biography: string | null) {
    setArtist((prev) => (prev ? { ...prev, biography } : prev));
  }

  function handlePhotoChange(artistPic: string | null) {
    setArtist((prev) => (prev ? { ...prev, artistPic } : prev));
  }

  if (loading) {
    return (
      <PageContainer>
        <PageStatus variant="loading" />
      </PageContainer>
    );
  }

  if (notFound || !artist) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This artist doesn't exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ArtistCard
        artist={artist}
        onNameChange={handleNameChange}
        onCountryChange={handleCountryChange}
        onTypeChange={handleTypeChange}
        onBiographyChange={handleBiographyChange}
        onPhotoChange={handlePhotoChange}
      />
      <ArtistAlbums
        key={artist.id}
        albums={artist.albums}
        onAlbumFavoriteChange={handleAlbumFavoriteChange}
      />
    </PageContainer>
  );
}

export default ArtistPage;
