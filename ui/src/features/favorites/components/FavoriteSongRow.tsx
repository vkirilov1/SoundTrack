import { Fragment } from "react";
import { Box, HStack, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import { coverImageUrl } from "../../../utils/images";
import type { FavoriteSong } from "../../profile/types";

interface FavoriteSongRowProps {
  song: FavoriteSong;
}

function FavoriteSongRow({ song }: FavoriteSongRowProps) {
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
      {song.albumCoverUrl ? (
        <Image
          src={coverImageUrl(song.albumCoverUrl)}
          alt=""
          flexShrink="0"
          boxSize="72px"
          borderRadius="md"
          objectFit="cover"
          bg="border"
        />
      ) : (
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
      )}

      <Box flex="1" minW="0" display="flex" flexDirection="column" gap="2px">
        <Text
          fontSize="17px"
          fontWeight="600"
          color="ink"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {song.title}
        </Text>

        <Text fontSize="14px" color="text" opacity="0.85">
          from{" "}
          <Link
            asChild
            color="text"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to={`/album/${song.albumId}`}>
              &ldquo;{song.albumTitle}&rdquo;
            </RouterLink>
          </Link>
        </Text>

        <Text fontSize="13px" color="text" opacity="0.7">
          {song.artists.map((artist, index) => (
            <Fragment key={artist.id}>
              {index > 0 && ", "}
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
            </Fragment>
          ))}
        </Text>

        <Text fontSize="13px" color="text" opacity="0.7">
          {song.duration}
        </Text>
      </Box>
    </HStack>
  );
}

export default FavoriteSongRow;
