import { useState } from "react";
import { addFavoriteSong, removeFavoriteSong } from "../api/favoriteApi";
import HeartIcon from "../../../components/HeartIcon/HeartIcon";
import { useAuth } from "../../../features/auth/stores/useAuth";
import type { AlbumSong } from "../types";
import styles from "./SongsSection.module.css";

interface SongsSectionProps {
  songs: AlbumSong[];
  onSongFavoriteChange: (songId: number, favorited: boolean) => void;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SongsSection({ songs, onSongFavoriteChange }: SongsSectionProps) {
  const { user: currentUser } = useAuth();
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  if (songs.length === 0) return null;

  function handleToggle(song: AlbumSong) {
    if (!currentUser || pendingIds.has(song.id)) return;

    const next = !song.favorited;

    setPendingIds((prev) => new Set(prev).add(song.id));
    onSongFavoriteChange(song.id, next);

    const request = next
      ? addFavoriteSong(song.id)
      : removeFavoriteSong(song.id);

    request
      .catch(() => onSongFavoriteChange(song.id, !next))
      .finally(() =>
        setPendingIds((prev) => {
          const updated = new Set(prev);
          updated.delete(song.id);
          return updated;
        }),
      );
  }

  return (
    <section className={styles.wrap}>
      <h2 className={styles.heading}>Songs</h2>
      <ul className={styles.list}>
        {songs.map((song) => (
          <li key={song.id} className={styles.row}>
            <span className={styles.position}>{song.position}</span>
            <div className={styles.info}>
              <span className={styles.title}>{song.title}</span>
              {song.artists.length > 0 && (
                <span className={styles.artists}>
                  {song.artists.map((artist) => artist.name).join(", ")}
                </span>
              )}
            </div>
            <span className={styles.duration}>
              {formatDuration(song.durationSeconds)}
            </span>
            {currentUser && (
              <button
                type="button"
                className={styles.heartButton}
                onClick={() => handleToggle(song)}
                disabled={pendingIds.has(song.id)}
                aria-label={
                  song.favorited ? "Remove from favorites" : "Add to favorites"
                }
                aria-pressed={song.favorited}
              >
                <HeartIcon filled={song.favorited} size={18} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SongsSection;
