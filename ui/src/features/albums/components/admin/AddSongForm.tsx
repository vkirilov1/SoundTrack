import { useState } from "react";
import { Box, HStack, Text, chakra } from "@chakra-ui/react";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import AddChipButton from "../../../../components/buttons/AddChipButton";
import ArtistPill from "./ArtistPill";
import AddArtistMenu from "./AddArtistMenu";
import { useSearchDropdown } from "../../../../hooks/useSearchDropdown";
import { searchAdminArtists } from "../../../edit-requests/api/adminContentApi";
import type { AlbumArtist } from "../../types";
import type { DraftSong } from "./CreateAlbumModal";

interface AddSongFormProps {
  onAdd: (song: DraftSong) => void;
}

function AddSongForm({ onAdd }: AddSongFormProps) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [artists, setArtists] = useState<AlbumArtist[]>([]);

  const {
    menuOpen,
    query,
    setQuery,
    results,
    searching,
    menuRef,
    toggleMenu,
    closeMenu,
  } = useSearchDropdown(searchAdminArtists);

  function handleAddArtist(artist: AlbumArtist) {
    if (!artists.some((a) => a.id === artist.id)) {
      setArtists((prev) => [...prev, artist]);
    }
    closeMenu();
  }

  function handleRemoveArtist(artistId: number) {
    setArtists((prev) => prev.filter((a) => a.id !== artistId));
  }

  const durationSeconds = (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
  const canAdd =
    title.trim().length > 0 && artists.length > 0 && durationSeconds > 0;

  function handleAdd() {
    if (!canAdd) return;

    onAdd({
      tempId: `${Date.now()}-${Math.random()}`,
      title: title.trim(),
      durationSeconds,
      artists,
    });

    setTitle("");
    setMinutes("");
    setSeconds("");
    setArtists([]);
  }

  const inputStyle = {
    font: "inherit",
    fontSize: "13px",
    color: "ink",
    bg: "bg",
    border: "1px solid",
    borderColor: "border",
    borderRadius: "md",
    px: "8px",
    py: "6px",
    outline: "none",
    _focus: { borderColor: "accent" },
  } as const;

  return (
    <Box border="1px dashed" borderColor="border" borderRadius="md" p="12px">
      <HStack gap="8px" flexWrap="wrap" align="center">
        <chakra.input
          placeholder="Song title"
          value={title}
          maxLength={255}
          onChange={(event) => setTitle(event.target.value)}
          flex="1"
          minW="140px"
          {...inputStyle}
        />
        <chakra.input
          type="number"
          placeholder="Min"
          min={0}
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          w="60px"
          {...inputStyle}
        />
        <Text as="span" color="text">
          :
        </Text>
        <chakra.input
          type="number"
          placeholder="Sec"
          min={0}
          max={59}
          value={seconds}
          onChange={(event) => setSeconds(event.target.value)}
          w="60px"
          {...inputStyle}
        />
      </HStack>

      <HStack mt="10px" flexWrap="wrap" gap="6px" align="center">
        {artists.map((artist) => (
          <ArtistPill
            key={artist.id}
            artist={artist}
            onRemove={() => handleRemoveArtist(artist.id)}
          />
        ))}
        <Box position="relative" ref={menuRef}>
          <AddChipButton
            onClick={toggleMenu}
            label="Add song artist"
            size={22}
          />
          {menuOpen && (
            <AddArtistMenu
              query={query}
              onQueryChange={setQuery}
              results={results}
              searching={searching}
              adding={false}
              error={null}
              onAdd={handleAddArtist}
            />
          )}
        </Box>
      </HStack>

      <PrimaryButton
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        mt="10px"
        fontSize="12px"
        px="14px"
        py="6px"
        h="auto"
      >
        Add song
      </PrimaryButton>
    </Box>
  );
}

export default AddSongForm;
