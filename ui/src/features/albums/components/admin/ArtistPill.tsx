import { HStack, Link, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import XIcon from "../../../../components/icons/XIcon";
import type { AlbumArtist } from "../../types";

interface ArtistPillProps {
  artist: AlbumArtist;
  onRemove: () => void;
}

function ArtistPill({ artist, onRemove }: ArtistPillProps) {
  return (
    <HStack
      gap="2px"
      bg="border"
      borderRadius="full"
      pl="10px"
      pr="4px"
      py="2px"
    >
      <Link
        asChild
        fontSize="14px"
        fontWeight="600"
        color="ink"
        textDecoration="none"
        _hover={{ color: "accent" }}
      >
        <RouterLink to={`/artist/${artist.id}`}>{artist.name}</RouterLink>
      </Link>
      <chakra.button
        type="button"
        onClick={onRemove}
        aria-label={`Remove artist ${artist.name}`}
        title={`Remove artist ${artist.name}`}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="16px"
        flexShrink="0"
        bg="none"
        border="none"
        borderRadius="full"
        color="text"
        cursor="pointer"
        transition="background-color 0.15s ease, color 0.15s ease"
        _hover={{ color: "white", bg: "danger" }}
      >
        <XIcon size={9} />
      </chakra.button>
    </HStack>
  );
}

export default ArtistPill;
