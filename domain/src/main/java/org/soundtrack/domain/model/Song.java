package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter
@Setter
@Table(name = "song")
public class Song {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "mbid", unique = true)
  private String mbid;

  @Column(name = "position", nullable = false)
  private Short position;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "duration", nullable = false)
  @JdbcTypeCode(SqlTypes.INTERVAL_SECOND)
  private Duration duration;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id", nullable = false)
  private Album album;

  @OneToMany(
      mappedBy = "song",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private Set<SongArtist> songArtists = new HashSet<>();

  /** @param position the artist's MusicBrainz credit order (0 = primary artist) */
  public void addArtist(Artist artist, int position) {
    SongArtist link = new SongArtist();
    link.setSong(this);
    link.setArtist(artist);
    link.setPosition(position);
    this.songArtists.add(link);
  }

  /**
   * Returns this song's artists ordered by MusicBrainz credit position (primary artist first),
   * falling back to alphabetical order for ties - e.g. rows imported before credit order was
   * tracked, which all default to position 0.
   */
  public List<Artist> getArtists() {
    return songArtists.stream()
        .sorted(
            Comparator.comparingInt(SongArtist::getPosition)
                .thenComparing(
                    link -> link.getArtist().getArtistName(), String.CASE_INSENSITIVE_ORDER))
        .map(SongArtist::getArtist)
        .toList();
  }
}
