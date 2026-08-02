package org.soundtrack.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Join entity linking an {@link Album} to an {@link Artist}, carrying the artist's credit order
 * for that album (0 = primary artist, matching MusicBrainz's artist-credit ordering). Rows
 * imported before this column existed default to 0, so they fall back to alphabetical ordering
 * at read time.
 */
@Entity
@Table(name = "album_artist")
@Getter
@Setter
public class AlbumArtist {

  @EmbeddedId private AlbumArtistId id = new AlbumArtistId();

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("albumId")
  @JoinColumn(name = "album_id")
  private Album album;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("artistId")
  @JoinColumn(name = "artist_id")
  private Artist artist;

  @Column(name = "position", nullable = false)
  private int position;
}
