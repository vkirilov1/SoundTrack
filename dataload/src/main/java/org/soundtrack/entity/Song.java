package org.soundtrack.entity;

import jakarta.persistence.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Entity class for Song object in db */
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

  @ManyToMany
  @JoinTable(
      name = "song_artist",
      joinColumns = @JoinColumn(name = "song_id"),
      inverseJoinColumns = @JoinColumn(name = "artist_id"))
  private List<Artist> artists = new ArrayList<>();

  public void addArtist(Artist artist) {
    this.artists.add(artist);
  }
}
