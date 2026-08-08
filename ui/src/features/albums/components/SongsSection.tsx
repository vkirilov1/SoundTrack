import { useState } from "react";
import { Box, chakra, Heading } from "@chakra-ui/react";
import { addFavoriteSong, removeFavoriteSong } from "../api/favoriteApi";
import { useAuth } from "../../../features/auth/stores/useAuth";
import SongRow from "./admin/SongRow";
import type { AlbumSong } from "../types";

interface SongsSectionProps {
  songs: AlbumSong[];
  onSongFavoriteChange: (songId: number, favorited: boolean) => void;
  onSongsChange: (songs: AlbumSong[]) => void;
}

function SongsSection({
  songs,
  onSongFavoriteChange,
  onSongsChange,
}: SongsSectionProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  if (songs.length === 0) return null;

  function handleToggleFavorite(song: AlbumSong) {
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

  function handleSongUpdate(updated: AlbumSong) {
    onSongsChange(
      songs.map((song) => (song.id === updated.id ? updated : song)),
    );
  }

  function handleSongRemove(songId: number) {
    onSongsChange(songs.filter((song) => song.id !== songId));
  }

  return (
    <Box as="section" mt="40px">
      <Heading as="h2" fontSize="22px">
        Songs
      </Heading>
      <chakra.ul
        listStyle="none"
        m="16px 0 0"
        p="0"
        display="flex"
        flexDirection="column"
      >
        {songs.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            isAdmin={isAdmin}
            favoritingEnabled={!!currentUser && !isAdmin}
            favoritePending={pendingIds.has(song.id)}
            onFavoriteToggle={() => handleToggleFavorite(song)}
            onUpdate={handleSongUpdate}
            onRemove={handleSongRemove}
          />
        ))}
      </chakra.ul>
    </Box>
  );
}

export default SongsSection;
