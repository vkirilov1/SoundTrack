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
public class SongArtistId implements Serializable {

  private Long songId;
  private Long artistId;

  public SongArtistId(Long songId, Long artistId) {
    this.songId = songId;
    this.artistId = artistId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof SongArtistId that)) return false;
    return Objects.equals(songId, that.songId) && Objects.equals(artistId, that.artistId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(songId, artistId);
  }
}
