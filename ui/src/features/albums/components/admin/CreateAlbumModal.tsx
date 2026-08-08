import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Field,
  HStack,
  Heading,
  Image,
  Input,
  Text,
  Textarea,
  VStack,
  chakra,
} from "@chakra-ui/react";
import Modal from "../../../../components/Modal/Modal";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../../components/buttons/SecondaryButton";
import AddChipButton from "../../../../components/buttons/AddChipButton";
import FormErrorBanner from "../../../../components/FormErrorBanner/FormErrorBanner";
import ImagePlaceholderIcon from "../../../../components/icons/ImagePlaceholderIcon";
import XIcon from "../../../../components/icons/XIcon";
import ArtistPill from "./ArtistPill";
import GenrePill from "../GenrePill";
import AddArtistMenu from "./AddArtistMenu";
import AddGenreMenu from "./AddGenreMenu";
import AddSongForm from "./AddSongForm";
import { useSearchDropdown } from "../../../../hooks/useSearchDropdown";
import { ApiError } from "../../../../lib/api-error";
import {
  createAlbum,
  searchAdminArtists,
  searchAdminGenres,
  uploadAlbumPhoto,
} from "../../../edit-requests/api/adminContentApi";
import type { AlbumArtist } from "../../types";
import SelectImageButton from "../../../edit-requests/components/SelectImageButton";

export interface DraftSong {
  tempId: string;
  title: string;
  durationSeconds: number;
  artists: AlbumArtist[];
}

interface CreateAlbumModalProps {
  onClose: () => void;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function CreateAlbumModal({ onClose }: CreateAlbumModalProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [artists, setArtists] = useState<AlbumArtist[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [songs, setSongs] = useState<DraftSong[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    menuOpen: artistMenuOpen,
    query: artistQuery,
    setQuery: setArtistQuery,
    results: artistResults,
    searching: artistSearching,
    menuRef: artistMenuRef,
    toggleMenu: toggleArtistMenu,
    closeMenu: closeArtistMenu,
  } = useSearchDropdown(searchAdminArtists);

  const {
    menuOpen: genreMenuOpen,
    query: genreQuery,
    setQuery: setGenreQuery,
    results: genreResults,
    searching: genreSearching,
    menuRef: genreMenuRef,
    toggleMenu: toggleGenreMenu,
    closeMenu: closeGenreMenu,
  } = useSearchDropdown(searchAdminGenres);

  function handleAddArtist(artist: AlbumArtist) {
    if (!artists.some((a) => a.id === artist.id)) {
      setArtists((prev) => [...prev, artist]);
    }
    closeArtistMenu();
  }

  function handleRemoveArtist(artistId: number) {
    setArtists((prev) => prev.filter((a) => a.id !== artistId));
  }

  function handleAddGenre(genre: string) {
    const trimmed = genre.trim();
    if (
      trimmed &&
      !genres.some((g) => g.toLowerCase() === trimmed.toLowerCase())
    ) {
      setGenres((prev) => [...prev, trimmed]);
    }
    closeGenreMenu();
  }

  function handleRemoveGenre(genre: string) {
    setGenres((prev) => prev.filter((g) => g !== genre));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleAddSong(song: DraftSong) {
    setSongs((prev) => [...prev, song]);
  }

  function handleRemoveSong(tempId: string) {
    setSongs((prev) => prev.filter((s) => s.tempId !== tempId));
  }

  const canSubmit =
    title.trim().length > 0 &&
    releaseDate.length > 0 &&
    artists.length > 0 &&
    photoFile !== null &&
    !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createAlbum({
        title: title.trim(),
        releaseDate,
        description: description.trim() || null,
        artistIds: artists.map((a) => a.id),
        genres,
        songs: songs.map((s) => ({
          title: s.title,
          durationSeconds: s.durationSeconds,
          artistIds: s.artists.map((a) => a.id),
        })),
      });

      if (photoFile) {
        await uploadAlbumPhoto(created.id, photoFile);
      }

      navigate(`/album/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create the album.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxW="640px">
      <chakra.form
        onSubmit={handleSubmit}
        noValidate
        display="flex"
        flexDirection="column"
        maxH="85vh"
      >
        <HStack
          justify="space-between"
          align="center"
          p="20px 24px"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Heading as="h2" fontSize="20px" m="0">
            Add Album
          </Heading>
          <chakra.button
            type="button"
            onClick={onClose}
            aria-label="Close"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="28px"
            bg="none"
            border="none"
            borderRadius="full"
            color="text"
            cursor="pointer"
            _hover={{ bg: "border", color: "ink" }}
          >
            <XIcon size={14} />
          </chakra.button>
        </HStack>

        <VStack align="stretch" gap="18px" p="24px" overflowY="auto">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Title
            </Field.Label>
            <Input
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Release date
            </Field.Label>
            <Input
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Box>
            <Text fontSize="14px" fontWeight="500" color="ink" mb="8px">
              Artists
            </Text>
            <HStack flexWrap="wrap" gap="6px" align="center">
              {artists.map((artist) => (
                <ArtistPill
                  key={artist.id}
                  artist={artist}
                  onRemove={() => handleRemoveArtist(artist.id)}
                />
              ))}
              <Box position="relative" ref={artistMenuRef}>
                <AddChipButton
                  onClick={toggleArtistMenu}
                  label="Add artist"
                  size={26}
                />
                {artistMenuOpen && (
                  <AddArtistMenu
                    query={artistQuery}
                    onQueryChange={setArtistQuery}
                    results={artistResults}
                    searching={artistSearching}
                    adding={false}
                    error={null}
                    onAdd={handleAddArtist}
                  />
                )}
              </Box>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="500" color="ink" mb="8px">
              Genres
            </Text>
            <HStack flexWrap="wrap" gap="8px" align="center">
              {genres.map((genre) => (
                <GenrePill
                  key={genre}
                  genre={genre}
                  size="primary"
                  removable
                  onRemove={() => handleRemoveGenre(genre)}
                />
              ))}
              <Box position="relative" ref={genreMenuRef}>
                <AddChipButton
                  onClick={toggleGenreMenu}
                  label="Add genre"
                  size={28}
                />
                {genreMenuOpen && (
                  <AddGenreMenu
                    query={genreQuery}
                    onQueryChange={setGenreQuery}
                    results={genreResults}
                    searching={genreSearching}
                    adding={false}
                    error={null}
                    onAdd={handleAddGenre}
                  />
                )}
              </Box>
            </HStack>
          </Box>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Description (optional)
            </Field.Label>
            <Textarea
              value={description}
              maxLength={2400}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              minH="90px"
              maxH="280px"
              resize="vertical"
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Box>
            <Text fontSize="14px" fontWeight="500" color="ink" mb="8px">
              Cover photo
            </Text>
            <HStack gap="14px" align="center">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt=""
                  boxSize="80px"
                  borderRadius="md"
                  objectFit="cover"
                />
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="80px"
                  flexShrink="0"
                  border="1.5px dashed"
                  borderColor="border"
                  borderRadius="md"
                  color="text"
                  opacity="0.55"
                >
                  <ImagePlaceholderIcon size={28} />
                </Box>
              )}
              <SelectImageButton handleFileChange={handlePhotoChange} />
            </HStack>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="500" color="ink" mb="8px">
              Songs
            </Text>
            {songs.length > 0 && (
              <VStack align="stretch" gap="6px" mb="10px">
                {songs.map((song) => (
                  <HStack
                    key={song.tempId}
                    gap="10px"
                    fontSize="13px"
                    py="6px"
                    px="8px"
                    bg="border"
                    borderRadius="md"
                  >
                    <Text
                      flex="1"
                      minW="0"
                      color="ink"
                      fontWeight="600"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {song.title}
                    </Text>
                    <Text color="text" flexShrink="0">
                      {song.artists.map((a) => a.name).join(", ")}
                    </Text>
                    <Text color="text" flexShrink="0">
                      {formatDuration(song.durationSeconds)}
                    </Text>
                    <chakra.button
                      type="button"
                      onClick={() => handleRemoveSong(song.tempId)}
                      aria-label={`Remove ${song.title}`}
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      boxSize="18px"
                      flexShrink="0"
                      bg="none"
                      border="none"
                      borderRadius="full"
                      color="text"
                      cursor="pointer"
                      _hover={{ color: "white", bg: "danger" }}
                    >
                      <XIcon size={10} />
                    </chakra.button>
                  </HStack>
                ))}
              </VStack>
            )}
            <AddSongForm onAdd={handleAddSong} />
          </Box>
        </VStack>

        <HStack
          justify="flex-end"
          gap="10px"
          p="16px 24px"
          borderTop="1px solid"
          borderColor="border"
        >
          <SecondaryButton
            onClick={onClose}
            disabled={submitting}
            fontSize="13px"
            px="16px"
            py="8px"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={!canSubmit}
            fontSize="13px"
            px="16px"
            py="8px"
            h="auto"
          >
            {submitting ? "Creating…" : "Create album"}
          </PrimaryButton>
        </HStack>
      </chakra.form>
    </Modal>
  );
}

export default CreateAlbumModal;
