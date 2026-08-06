import {
  Box,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MONTH_DAY_FORMAT, YEAR_FORMAT } from "../../../utils/date";
import { formatCompactCount } from "../../../utils/format";
import AlbumActions from "./AlbumActions";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import TextButton from "../../../components/buttons/TextButton";
import { coverImageUrl } from "../../../utils/images";
import type { RefObject } from "react";
import type { AlbumDetail } from "../types";
import { useAuth } from "../../auth/stores/useAuth";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import EditableDescription from "../../edit-requests/components/EditableDescription";
import {
  updateAlbumDescription,
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
}: AlbumCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

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
        <Heading
          as="h1"
          fontSize="28px"
          overflowWrap="break-word"
          wordBreak="break-word"
        >
          {album.title}
        </Heading>

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

        <Text mt="4px" fontSize="14px" color="text">
          {MONTH_DAY_FORMAT.format(new Date(album.releaseDate))},{" "}
          <Link asChild textDecoration="none" _hover={{ color: "accentHover" }}>
            {" "}
            <RouterLink to={`/album/year/${releaseYear}`}>
              {releaseYear}
            </RouterLink>
          </Link>
        </Text>

        {album.genres.length > 0 && (
          <VStack mt="16px" align="stretch" gap="8px">
            <HStack flexWrap="wrap" gap="8px">
              {primaryGenres.map((genre) => (
                <Link
                  asChild
                  key={genre}
                  fontSize="13px"
                  fontWeight="600"
                  color="ink"
                  bg="border"
                  px="14px"
                  py="6px"
                  borderRadius="full"
                  textDecoration="none"
                  _hover={{ bg: "accent", color: "white" }}
                >
                  <RouterLink to={`/genre/${encodeURIComponent(genre)}`}>
                    {genre}
                  </RouterLink>
                </Link>
              ))}
            </HStack>
            {secondaryGenres.length > 0 && (
              <HStack flexWrap="wrap" gap="8px">
                {secondaryGenres.map((genre) => (
                  <Link
                    asChild
                    key={genre}
                    fontSize="12px"
                    color="text"
                    bg="border"
                    opacity="0.7"
                    px="10px"
                    py="4px"
                    borderRadius="full"
                    textDecoration="none"
                    _hover={{ bg: "accent", color: "white", opacity: "1" }}
                  >
                    <RouterLink to={`/genre/${encodeURIComponent(genre)}`}>
                      {genre}
                    </RouterLink>
                  </Link>
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
                  <RouterLink to={`/album/year/${releaseYear}`}>
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
