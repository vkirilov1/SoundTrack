import {
  Box,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MONTH_DAY_FORMAT, YEAR_FORMAT } from "../../../utils/date";
import { formatCompactCount } from "../../../utils/format";
import AlbumActions from "./AlbumActions";
import GenrePill from "./GenrePill";
import ArtistPill from "./admin/ArtistPill";
import AddGenreMenu from "./admin/AddGenreMenu";
import AddArtistMenu from "./admin/AddArtistMenu";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import EditIconButton from "../../../components/buttons/EditIconButton";
import AddChipButton from "../../../components/buttons/AddChipButton";
import TextButton from "../../../components/buttons/TextButton";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import { coverImageUrl } from "../../../utils/images";
import type { RefObject } from "react";
import type { AlbumArtist, AlbumDetail } from "../types";
import { useAuth } from "../../auth/stores/useAuth";
import { useAdminGenreEditor } from "../hooks/useAdminGenreEditor";
import { useAdminArtistEditor } from "../hooks/useAdminArtistEditor";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import EditableDescription from "../../edit-requests/components/EditableDescription";
import InlineTextEditForm from "../../edit-requests/components/InlineTextEditForm";
import {
  addAlbumArtist,
  deleteAlbumAsAdmin,
  removeAlbumArtist,
  removeAlbumGenre,
  updateAlbumDescription,
  updateAlbumReleaseDate,
  updateAlbumTitle,
  uploadAlbumPhoto,
} from "../../edit-requests/api/adminContentApi";

const PRIMARY_GENRE_COUNT = 4;
const SECONDARY_GENRE_COUNT = 8;

const coverSize = { base: "100%", sm: "260px" };

interface AlbumCardProps {
  album: AlbumDetail;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onAlbumFavoriteChange: (nextFavorited: boolean) => void;
  onDescriptionChange: (description: string | null) => void;
  onCoverChange: (coverUrl: string | null) => void;
  onGenresChange: (genres: string[]) => void;
  onTitleChange: (title: string) => void;
  onReleaseDateChange: (releaseDate: string) => void;
  onArtistsChange: (artists: AlbumArtist[]) => void;
}

function AlbumCover({
  coverUrl,
  title,
}: {
  coverUrl: string | null;
  title: string;
}) {
  if (coverUrl) {
    return (
      <Image
        src={coverImageUrl(coverUrl)}
        alt={title}
        flexShrink="0"
        w={coverSize}
        h="260px"
        borderRadius="md"
        objectFit="cover"
        bg="border"
      />
    );
  }

  return (
    <Box
      as="span"
      aria-hidden="true"
      flexShrink="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w={coverSize}
      h="260px"
      border="1.5px solid"
      borderColor="border"
      borderRadius="md"
      color="text"
      opacity="0.55"
    >
      <ImagePlaceholderIcon size={64} />
    </Box>
  );
}

function AlbumCard({
  album,
  commentInputRef,
  onAlbumFavoriteChange,
  onDescriptionChange,
  onCoverChange,
  onGenresChange,
  onTitleChange,
  onReleaseDateChange,
  onArtistsChange,
}: AlbumCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const navigate = useNavigate();

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const {
    menuOpen: genreMenuOpen,
    query: genreQuery,
    setQuery: setGenreQuery,
    results: genreResults,
    searching: genreSearching,
    adding: genreAdding,
    error: genreError,
    menuRef: genreMenuRef,
    openMenu: openGenreMenu,
    handleAdd: handleAddGenre,
  } = useAdminGenreEditor(album.id, onGenresChange);

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
  } = useAdminArtistEditor(album.id, addAlbumArtist, onArtistsChange);

  function handleRemoveGenre(genre: string) {
    removeAlbumGenre(album.id, genre)
      .then((updated) => onGenresChange(updated.genres))
      .catch(() => {});
  }

  function handleRemoveArtist(artistId: number) {
    removeAlbumArtist(album.id, artistId)
      .then((updated) => onArtistsChange(updated.artists))
      .catch(() => {});
  }

  async function handleSaveTitle(title: string) {
    const updated = await updateAlbumTitle(album.id, title);
    onTitleChange(updated.title);
  }

  async function handleSaveReleaseDate(releaseDate: string) {
    const updated = await updateAlbumReleaseDate(
      album.id,
      album.title,
      releaseDate,
    );
    onReleaseDateChange(updated.releaseDate);
  }

  function focusReviewInput() {
    commentInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    commentInputRef.current?.focus();
  }

  async function handleSaveDescription(text: string) {
    const updated = await updateAlbumDescription(album.id, album.title, text);
    onDescriptionChange(updated.description);
  }

  async function handleSavePhoto(file: File) {
    const updated = await uploadAlbumPhoto(album.id, file);
    onCoverChange(updated.coverUrl);
  }

  function handleDeleteAlbum() {
    return deleteAlbumAsAdmin(album.id).then(() => navigate("/"));
  }

  const primaryGenres = album.genres.slice(0, PRIMARY_GENRE_COUNT);
  const secondaryGenres = album.genres.slice(
    PRIMARY_GENRE_COUNT,
    PRIMARY_GENRE_COUNT + SECONDARY_GENRE_COUNT,
  );

  const releaseYear = YEAR_FORMAT.format(new Date(album.releaseDate));

  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", sm: "row" }}
      gap="32px"
      p="32px"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.06)"
    >
      <Box position="relative" flexShrink="0">
        <AlbumCover coverUrl={album.coverUrl} title={album.title} />
        {isAdmin && (
          <AdminPhotoEditButton
            onSavePhoto={handleSavePhoto}
            label="Change cover"
          />
        )}
      </Box>

      <Box flex="1" minW="0" display="flex" flexDirection="column">
        <HStack align="center" gap="6px">
          {!editingTitle && (
            <Heading
              as="h1"
              fontSize="28px"
              m="0"
              overflowWrap="break-word"
              wordBreak="break-word"
            >
              {album.title}
            </Heading>
          )}
          {isAdmin && (
            <InlineTextEditForm
              currentText={album.title}
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
                <EditIconButton onClick={open} label="Edit title" />
              )}
            />
          )}
        </HStack>

        {isAdmin && (
          <Box mt="6px">
            <ConfirmDeleteControl
              label="Delete album"
              confirmMessage="Delete this album and all its reviews? This can't be undone."
              onDelete={handleDeleteAlbum}
            />
          </Box>
        )}

        {isAdmin ? (
          <HStack mt="8px" flexWrap="wrap" gap="6px" align="center">
            {album.artists.map((artist) => (
              <ArtistPill
                key={artist.id}
                artist={artist}
                onRemove={() => handleRemoveArtist(artist.id)}
              />
            ))}
            <Box position="relative" ref={artistMenuRef}>
              <AddChipButton
                onClick={openArtistMenu}
                label="Add artist"
                size={26}
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
          <Text
            mt="6px"
            fontSize="16px"
            overflowWrap="break-word"
            wordBreak="break-word"
          >
            {album.artists.map((artist, index) => (
              <Box as="span" key={artist.id}>
                {index > 0 && ", "}
                <Link
                  asChild
                  color="accent"
                  textDecoration="none"
                  fontWeight="600"
                  _hover={{ color: "accentHover" }}
                >
                  <RouterLink to={`/artist/${artist.id}`}>
                    {artist.name}
                  </RouterLink>
                </Link>
              </Box>
            ))}
          </Text>
        )}

        <HStack mt="4px" align="center" gap="6px">
          {!editingDate && (
            <Text fontSize="14px" color="text" m="0">
              {MONTH_DAY_FORMAT.format(new Date(album.releaseDate))},{" "}
              <Link
                asChild
                textDecoration="none"
                _hover={{ color: "accentHover" }}
              >
                <RouterLink to={`/charts/${releaseYear}`}>
                  {releaseYear}
                </RouterLink>
              </Link>
            </Text>
          )}
          {isAdmin && (
            <InlineTextEditForm
              currentText={album.releaseDate}
              onSubmit={handleSaveReleaseDate}
              onEditingChange={setEditingDate}
              variant="date"
              disallowEmpty
              submitLabel="Save"
              submittingLabel="Saving…"
              errorFallback="Couldn't save the release date."
              renderTrigger={(open) => (
                <EditIconButton
                  onClick={open}
                  label="Edit release date"
                  size={13}
                />
              )}
            />
          )}
        </HStack>

        {(album.genres.length > 0 || isAdmin) && (
          <VStack mt="16px" align="stretch" gap="8px">
            <HStack flexWrap="wrap" gap="8px">
              {primaryGenres.map((genre) => (
                <GenrePill
                  key={genre}
                  genre={genre}
                  size="primary"
                  removable={isAdmin}
                  onRemove={() => handleRemoveGenre(genre)}
                />
              ))}
              {isAdmin && (
                <Box position="relative" ref={genreMenuRef}>
                  <AddChipButton
                    onClick={openGenreMenu}
                    label="Add genre"
                    size={28}
                  />

                  {genreMenuOpen && (
                    <AddGenreMenu
                      query={genreQuery}
                      onQueryChange={setGenreQuery}
                      results={genreResults}
                      searching={genreSearching}
                      adding={genreAdding}
                      error={genreError}
                      onAdd={handleAddGenre}
                    />
                  )}
                </Box>
              )}
            </HStack>
            {secondaryGenres.length > 0 && (
              <HStack flexWrap="wrap" gap="8px">
                {secondaryGenres.map((genre) => (
                  <GenrePill
                    key={genre}
                    genre={genre}
                    size="secondary"
                    removable={isAdmin}
                    onRemove={() => handleRemoveGenre(genre)}
                  />
                ))}
              </HStack>
            )}
          </VStack>
        )}

        {album.reviewsCount === 0 ? (
          <Text mt="18px" fontSize="14px" color="text">
            No reviews yet, be the{" "}
            <TextButton
              fontSize="inherit"
              fontWeight="700"
              onClick={focusReviewInput}
            >
              first
            </TextButton>
          </Text>
        ) : (
          <Text mt="18px">
            <Text as="span" fontSize="22px" fontWeight="700" color="accent">
              {album.rating.toFixed(2)}/5
            </Text>

            <Text as="span" fontSize="12px" color="gray.400">
              {" "}
              based on{" "}
              <Text as="span" fontWeight="700" color="ink">
                {formatCompactCount(album.reviewsCount)}
              </Text>{" "}
              {album.reviewsCount === 1 ? "review" : "reviews"}
            </Text>

            {album.yearRank && (
              <Text as="span" ml="10px" fontSize="18px">
                <Text as="span" fontWeight="700" color="accent">
                  #{album.yearRank}
                </Text>{" "}
                for{" "}
                <Link
                  asChild
                  color="ink"
                  fontWeight="700"
                  textDecoration="none"
                  _hover={{ color: "accent" }}
                >
                  <RouterLink to={`/charts/${releaseYear}`}>
                    {releaseYear}
                  </RouterLink>
                </Link>
              </Text>
            )}
          </Text>
        )}

        <AlbumActions
          albumId={album.id}
          favorited={album.favorited}
          onFavoriteChange={onAlbumFavoriteChange}
        />

        <Box mt="18px">
          <EditableDescription
            text={album.description}
            targetType="ALBUM"
            targetId={album.id}
            onSave={handleSaveDescription}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default AlbumCard;
