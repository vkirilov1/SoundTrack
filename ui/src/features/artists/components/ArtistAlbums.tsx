import { Box, Heading, chakra } from "@chakra-ui/react";
import type { ArtistAlbum } from "../types";
import ArtistAlbumRow from "./ArtistAlbumRow";

interface ArtistAlbumsProps {
  albums: ArtistAlbum[];
  onAlbumFavoriteChange: (albumId: number, favorited: boolean) => void;
}

function ArtistAlbums({ albums, onAlbumFavoriteChange }: ArtistAlbumsProps) {
  if (albums.length === 0) return null;

  return (
    <Box as="section" mt="48px">
      <Heading as="h2" fontSize="22px">
        Albums
      </Heading>
      <chakra.ul listStyle="none" m="16px 0 0" p="0">
        {albums.map((album) => (
          <ArtistAlbumRow
            key={album.id}
            album={album}
            onFavoriteChange={onAlbumFavoriteChange}
          />
        ))}
      </chakra.ul>
    </Box>
  );
}

export default ArtistAlbums;
