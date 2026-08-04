import { Fragment, useState } from "react";
import { Box, chakra, Heading, HStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { addFavoriteSong, removeFavoriteSong } from "../api/favoriteApi";
import HeartToggleButton from "../../../components/HeartToggleButton/HeartToggleButton";
import { useAuth } from "../../../features/auth/stores/useAuth";
import type { AlbumSong } from "../types";

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
          <HStack
            as="li"
            key={song.id}
            gap="14px"
            py="10px"
            px="4px"
            borderBottom="1px solid"
            borderColor="border"
            _last={{ borderBottom: "none" }}
          >
            <Text
              as="span"
              flexShrink="0"
              w="22px"
              textAlign="right"
              fontSize="13px"
              color="text"
              opacity="0.7"
            >
              {song.position}
            </Text>
            <Box flex="1" minW="0" display="flex" flexDirection="column">
              <Text
                as="span"
                fontSize="14px"
                fontWeight="600"
                color="ink"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {song.title}
              </Text>
              {song.artists.length > 0 && (
                <Box as="span">
                  {song.artists.map((artist, index) => (
                    <Fragment key={artist.id}>
                      <Link
                        asChild
                        fontSize="12px"
                        color="text"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        textDecoration="none"
                        _hover={{ color: "accentHover" }}
                      >
                        <RouterLink to={`/artist/${artist.id}`}>
                          {artist.name}
                        </RouterLink>
                      </Link>
                      {index < song.artists.length - 1 && ", "}
                    </Fragment>
                  ))}
                </Box>
              )}
            </Box>
            <Text
              as="span"
              flexShrink="0"
              fontSize="13px"
              color="text"
              opacity="0.8"
            >
              {formatDuration(song.durationSeconds)}
            </Text>
            {currentUser && currentUser.role !== "ADMIN" && (
              <HeartToggleButton
                filled={song.favorited}
                onClick={() => handleToggle(song)}
                disabled={pendingIds.has(song.id)}
              />
            )}
          </HStack>
        ))}
      </chakra.ul>
    </Box>
  );
}

export default SongsSection;
