import { Fragment, useState } from "react";
import { Box, HStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import HeartToggleButton from "../../../../components/HeartToggleButton/HeartToggleButton";
import ConfirmDeleteControl from "../../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import EditIconButton from "../../../../components/buttons/EditIconButton";
import AddChipButton from "../../../../components/buttons/AddChipButton";
import InlineTextEditForm from "../../../edit-requests/components/InlineTextEditForm";
import ArtistPill from "./ArtistPill";
import AddArtistMenu from "./AddArtistMenu";
import { useAdminArtistEditor } from "../../hooks/useAdminArtistEditor";
import {
  addSongArtist,
  deleteSong,
  removeSongArtist,
  updateSongDuration,
  updateSongPosition,
  updateSongTitle,
} from "../../../edit-requests/api/adminContentApi";
import { formatDuration, parseDurationInput } from "../../../../utils/duration";
import type { AlbumSong } from "../../types";

interface SongRowProps {
  song: AlbumSong;
  isAdmin: boolean;
  favoritingEnabled: boolean;
  onFavoriteToggle: () => void;
  favoritePending: boolean;
  onUpdate: (song: AlbumSong) => void;
  onRemove: (songId: number) => void;
}

function SongRow({
  song,
  isAdmin,
  favoritingEnabled,
  onFavoriteToggle,
  favoritePending,
  onUpdate,
  onRemove,
}: SongRowProps) {
  const [editingPosition, setEditingPosition] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);

  const {
    menuOpen: artistMenuOpen,
    query: artistQuery,
    setQuery: setArtistQuery,
    results: artistResults,
    searching: artistSearching,
    adding: artistAdding,
    error: artistError,
    menuRef: artistMenuRef,
    openMenu: openArtistMenu,
    handleAdd: handleAddArtist,
  } = useAdminArtistEditor(song.id, addSongArtist, (artists) =>
    onUpdate({ ...song, artists }),
  );

  function handleRemoveArtist(artistId: number) {
    removeSongArtist(song.id, artistId)
      .then((updated) => onUpdate({ ...song, artists: updated.artists }))
      .catch(() => {});
  }

  async function handleSavePosition(text: string) {
    const position = Number(text);
    const updated = await updateSongPosition(song.id, position);
    onUpdate({ ...song, position: updated.position });
  }

  async function handleSaveTitle(title: string) {
    const updated = await updateSongTitle(song.id, title);
    onUpdate({ ...song, title: updated.title });
  }

  async function handleSaveDuration(text: string) {
    const durationSeconds = parseDurationInput(text);
    if (durationSeconds === null) {
      throw new Error("Use M:SS format, e.g. 3:45");
    }
    const updated = await updateSongDuration(
      song.id,
      song.title,
      durationSeconds,
    );
    onUpdate({ ...song, durationSeconds: updated.durationSeconds });
  }

  return (
    <HStack
      as="li"
      gap="14px"
      py="10px"
      px="4px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
      align="flex-start"
    >
      {!editingPosition && (
        <Text
          as="span"
          flexShrink="0"
          w="22px"
          mt="2px"
          textAlign="right"
          fontSize="13px"
          color="text"
          opacity="0.7"
        >
          {song.position}
        </Text>
      )}
      {isAdmin && (
        <InlineTextEditForm
          currentText={song.position.toString()}
          onSubmit={handleSavePosition}
          onEditingChange={setEditingPosition}
          variant="text"
          maxLength={3}
          formWidth="140px"
          disallowEmpty
          autoFocusTextarea
          submitLabel="Save"
          submittingLabel="Saving…"
          errorFallback="Couldn't save number."
          renderTrigger={(open) => (
            <EditIconButton
              onClick={open}
              label="Edit song position"
              size={12}
            />
          )}
        />
      )}
      <Box flex="1" minW="0" display="flex" flexDirection="column" gap="4px">
        <HStack align="center" gap="4px">
          {!editingTitle && (
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
          )}
          {isAdmin && (
            <InlineTextEditForm
              currentText={song.title}
              onSubmit={handleSaveTitle}
              onEditingChange={setEditingTitle}
              variant="text"
              maxLength={255}
              disallowEmpty
              autoFocusTextarea
              submitLabel="Save"
              submittingLabel="Saving…"
              errorFallback="Couldn't save the title."
              renderTrigger={(open) => (
                <EditIconButton
                  onClick={open}
                  label="Edit song title"
                  size={12}
                />
              )}
            />
          )}
        </HStack>

        {isAdmin ? (
          <HStack flexWrap="wrap" gap="6px" align="center">
            {song.artists.map((artist) => (
              <ArtistPill
                key={artist.id}
                artist={artist}
                onRemove={() => handleRemoveArtist(artist.id)}
              />
            ))}
            <Box position="relative" ref={artistMenuRef}>
              <AddChipButton
                onClick={openArtistMenu}
                label="Add song artist"
                size={20}
              />
              {artistMenuOpen && (
                <AddArtistMenu
                  query={artistQuery}
                  onQueryChange={setArtistQuery}
                  results={artistResults}
                  searching={artistSearching}
                  adding={artistAdding}
                  error={artistError}
                  onAdd={(artist) => handleAddArtist(artist.id)}
                />
              )}
            </Box>
          </HStack>
        ) : (
          song.artists.length > 0 && (
            <Box as="span">
              {song.artists.map((artist, index) => (
                <Fragment key={artist.id}>
                  <Link
                    asChild
                    fontSize="12px"
                    color="text"
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
          )
        )}
      </Box>

      <HStack flexShrink="0" gap="4px" align="center" mt="2px">
        {!editingDuration && (
          <Text as="span" fontSize="13px" color="text" opacity="0.8">
            {formatDuration(song.durationSeconds)}
          </Text>
        )}
        {isAdmin && (
          <InlineTextEditForm
            currentText={formatDuration(song.durationSeconds)}
            onSubmit={handleSaveDuration}
            onEditingChange={setEditingDuration}
            variant="text"
            maxLength={8}
            disallowEmpty
            autoFocusTextarea
            submitLabel="Save"
            submittingLabel="Saving…"
            errorFallback="Use M:SS format, e.g. 3:45"
            renderTrigger={(open) => (
              <EditIconButton
                onClick={open}
                label="Edit song duration"
                size={12}
              />
            )}
          />
        )}
      </HStack>

      {favoritingEnabled && (
        <HeartToggleButton
          filled={song.favorited}
          onClick={onFavoriteToggle}
          disabled={favoritePending}
        />
      )}

      {isAdmin && (
        <ConfirmDeleteControl
          label="Remove"
          confirmMessage="Remove this song?"
          onDelete={() => deleteSong(song.id).then(() => onRemove(song.id))}
        />
      )}
    </HStack>
  );
}

export default SongRow;
