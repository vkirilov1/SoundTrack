import { useState } from "react";
import { Box, Heading, chakra } from "@chakra-ui/react";
import Pagination from "../../../components/Pagination/Pagination";
import type { ArtistAlbum } from "../types";
import ArtistAlbumRow from "./ArtistAlbumRow";

const PAGE_SIZE = 20;

interface ArtistAlbumsProps {
  albums: ArtistAlbum[];
  onAlbumFavoriteChange: (albumId: number, favorited: boolean) => void;
}

/** Client-side pagination - the artist detail response already returns every album in one shot. */
function ArtistAlbums({ albums, onAlbumFavoriteChange }: ArtistAlbumsProps) {
  const [page, setPage] = useState(0);

  if (albums.length === 0) return null;

  const totalPages = Math.ceil(albums.length / PAGE_SIZE);
  const pageAlbums = albums.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <Box as="section" mt="48px">
      <Heading as="h2" fontSize="22px">
        Albums
      </Heading>
      <chakra.ul listStyle="none" m="16px 0 0" p="0">
        {pageAlbums.map((album) => (
          <ArtistAlbumRow
            key={album.id}
            album={album}
            onFavoriteChange={onAlbumFavoriteChange}
          />
        ))}
      </chakra.ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Box>
  );
}

export default ArtistAlbums;
