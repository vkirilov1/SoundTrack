import { chakra } from "@chakra-ui/react";
import type { AlbumSummary } from "../types";
import AlbumGridRow from "./AlbumGridRow";

interface AlbumGridProps {
  albums: AlbumSummary[];
  /** Page offset (page * size) so rank numbers stay continuous across pages. */
  rankOffset: number;
  displayRank: boolean;
}

function AlbumGrid({ albums, rankOffset, displayRank }: AlbumGridProps) {
  return (
    <chakra.ul listStyle="none" m="0" p="0">
      {albums.map((album, index) => (
        <AlbumGridRow
          key={album.id}
          album={album}
          rank={displayRank ? rankOffset + index + 1 : null}
        />
      ))}
    </chakra.ul>
  );
}

export default AlbumGrid;
