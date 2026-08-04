import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { getArtist } from "../api/artistApi";
import { ApiError } from "../../../lib/api-error";
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

  function handleBiographyChange(biography: string | null) {
    setArtist((prev) => (prev ? { ...prev, biography } : prev));
  }

  function handlePhotoChange(artistPic: string | null) {
    setArtist((prev) => (prev ? { ...prev, artistPic } : prev));
  }

  const wrapProps = {
    as: "section" as const,
    w: "100%",
    maxW: "contentWidth",
    mx: "auto",
    px: "24px",
    pt: "56px",
    pb: "80px",
  };

  if (loading) {
    return (
      <Box {...wrapProps}>
        <PageStatus variant="loading" />
      </Box>
    );
  }

  if (notFound || !artist) {
    return (
      <Box {...wrapProps}>
        <PageStatus variant="not-found" message="This artist doesn't exist." />
      </Box>
    );
  }

  return (
    <Box {...wrapProps}>
      <ArtistCard
        artist={artist}
        onBiographyChange={handleBiographyChange}
        onPhotoChange={handlePhotoChange}
      />
      <ArtistAlbums
        albums={artist.albums}
        onAlbumFavoriteChange={handleAlbumFavoriteChange}
      />
    </Box>
  );
}

export default ArtistPage;
