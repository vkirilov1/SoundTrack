import { Fragment } from "react";
import { Box, HStack, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import ImagePlaceholderIcon from "../icons/ImagePlaceholderIcon";
import ConfirmDeleteControl from "../ConfirmDeleteControl/ConfirmDeleteControl";
import { coverImageUrl } from "../../utils/images";
import { SHORT_DATE_FORMAT } from "../../utils/date";
import type { AlbumSummary } from "../../types/album";

interface AlbumGridRowProps {
  album: AlbumSummary;
  rank: number | null;
  isEditable?: boolean;
  onRemove?: () => Promise<unknown>;
  /**
   * Renders title/artist/genre as plain text instead of links - for a draft still being built
   * inside a modal (e.g. picking albums while creating a list), where navigating away would lose
   * whatever hasn't been saved yet.
   */
  disableLinks?: boolean;
}

function CoverPlaceholder() {
  return (
    <Box
      as="span"
      aria-hidden="true"
      flexShrink="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="72px"
      border="1.5px solid"
      borderColor="border"
      borderRadius="md"
      color="text"
      opacity="0.55"
    >
      <ImagePlaceholderIcon size={28} />
    </Box>
  );
}

const MAX_VISIBLE_GENRES = 3;

function AlbumGridRow({
  album,
  rank,
  isEditable,
  onRemove,
  disableLinks,
}: AlbumGridRowProps) {
  const visibleGenres = album.genres.slice(0, MAX_VISIBLE_GENRES);
  const extraGenreCount = album.genres.length - visibleGenres.length;

  return (
    <HStack
      as="li"
      gap="20px"
      py="16px"
      px="4px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
    >
      {album.coverUrl ? (
        <Image
          src={coverImageUrl(album.coverUrl)}
          alt=""
          flexShrink="0"
          boxSize="72px"
          borderRadius="md"
          objectFit="cover"
          bg="border"
        />
      ) : (
        <CoverPlaceholder />
      )}

      <Box flex="1" minW="0" display="flex" flexDirection="column" gap="2px">
        <HStack>
          {disableLinks ? (
            <Text
              m="0"
              fontSize="17px"
              fontWeight="600"
              color="ink"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {album.title}
            </Text>
          ) : (
            <Link
              asChild
              fontSize="17px"
              fontWeight="600"
              color="ink"
              textDecoration="none"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              _hover={{ color: "accentHover" }}
            >
              <RouterLink to={`/album/${album.id}`}>{album.title}</RouterLink>
            </Link>
          )}
        </HStack>
        <Text fontSize="14px" color="text" opacity="0.85">
          {album.artists.map((artist, index) => (
            <Fragment key={artist.id}>
              {index > 0 && ", "}
              {disableLinks ? (
                artist.name
              ) : (
                <Link
                  asChild
                  color="text"
                  textDecoration="none"
                  _hover={{ color: "accentHover" }}
                >
                  <RouterLink to={`/artist/${artist.id}`}>
                    {artist.name}
                  </RouterLink>
                </Link>
              )}
            </Fragment>
          ))}
        </Text>

        <Text fontSize="13px" color="text" opacity="0.7">
          {SHORT_DATE_FORMAT.format(new Date(album.releaseDate))}
        </Text>

        {visibleGenres.length > 0 && (
          <Text fontSize="12px" color="text" opacity="0.7">
            {visibleGenres.map((genre, index) => (
              <Fragment key={genre}>
                {index > 0 && ", "}
                {disableLinks ? (
                  genre
                ) : (
                  <Link
                    asChild
                    color="text"
                    textDecoration="none"
                    _hover={{ color: "accentHover" }}
                  >
                    <RouterLink to={`/genre/${encodeURIComponent(genre)}`}>
                      {genre}
                    </RouterLink>
                  </Link>
                )}
              </Fragment>
            ))}
            {extraGenreCount > 0 && ` +${extraGenreCount} more`}
          </Text>
        )}
      </Box>

      <Box flexShrink="0" textAlign="right" minW="60px">
        {album.reviewsCount > 0 ? (
          <>
            <Text fontSize="16px" fontWeight="700" color="accent">
              {album.rating.toFixed(1)}/5
            </Text>
            <Text fontSize="12px" color="text" opacity="0.7">
              {album.reviewsCount}{" "}
              {album.reviewsCount === 1 ? "review" : "reviews"}
            </Text>
          </>
        ) : (
          <Text
            fontSize="24px"
            fontWeight="800"
            color="text"
            opacity="0.5"
            aria-label="Not yet reviewed"
          >
            -
          </Text>
        )}
      </Box>

      {rank && (
        <Text
          flexShrink="0"
          minW="32px"
          textAlign="right"
          fontSize="18px"
          fontWeight="700"
          color="ink"
          whiteSpace="nowrap"
        >
          #{rank}
        </Text>
      )}

      {isEditable && onRemove && (
        <Box flexShrink="0" alignSelf="center">
          <ConfirmDeleteControl
            label="Remove"
            confirmMessage="Remove?"
            onDelete={onRemove}
          />
        </Box>
      )}
    </HStack>
  );
}

export default AlbumGridRow;
