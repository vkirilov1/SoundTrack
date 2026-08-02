import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist } from "../api/artistApi";
import { ApiError } from "../../../lib/api-error";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import Spinner from "../../../components/Spinner/Spinner";
import type { ArtistDetail } from "../types";
import styles from "./ArtistPage.module.css";
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

  if (loading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <Spinner />
        </div>
      </section>
    );
  }

  if (notFound || !artist) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <img
            src={missingResourcesIcon}
            alt=""
            className={styles.statusIcon}
          />
          <p>This artist doesn't exist.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <ArtistCard artist={artist} />
      <ArtistAlbums
        albums={artist.albums}
        onAlbumFavoriteChange={handleAlbumFavoriteChange}
      />
    </section>
  );
}

export default ArtistPage;
