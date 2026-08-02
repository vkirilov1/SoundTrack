import type { ArtistAlbum } from "../types";
import ArtistAlbumRow from "./ArtistAlbumRow";
import styles from "./ArtistAlbums.module.css";

interface ArtistAlbumsProps {
  albums: ArtistAlbum[];
  onAlbumFavoriteChange: (albumId: number, favorited: boolean) => void;
}

function ArtistAlbums({ albums, onAlbumFavoriteChange }: ArtistAlbumsProps) {
  if (albums.length === 0) return null;

  return (
    <section className={styles.wrap}>
      <h2 className={styles.heading}>Albums</h2>
      <ul className={styles.list}>
        {albums.map((album) => (
          <ArtistAlbumRow
            key={album.id}
            album={album}
            onFavoriteChange={onAlbumFavoriteChange}
          />
        ))}
      </ul>
    </section>
  );
}

export default ArtistAlbums;
