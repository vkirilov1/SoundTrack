package org.soundtrack.domain.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class AlbumArtistId implements Serializable {

  private Long albumId;
  private Long artistId;

  public AlbumArtistId(Long albumId, Long artistId) {
    this.albumId = albumId;
    this.artistId = artistId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof AlbumArtistId that)) return false;
    return Objects.equals(albumId, that.albumId) && Objects.equals(artistId, that.artistId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(albumId, artistId);
  }
}
