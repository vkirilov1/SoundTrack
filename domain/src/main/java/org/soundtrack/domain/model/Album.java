package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.*;
import lombok.Getter;
import lombok.Setter;

/** Entity class for Album object in db */
@Entity
@Getter
@Setter
@Table(name = "album")
public class Album {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "mbid", nullable = false, unique = true)
  private String mbid;

  @Column(name = "releaseid", nullable = false, unique = true)
  private String releaseid;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "release_date", nullable = false)
  private LocalDate releaseDate;

  @Column(name = "rating", nullable = false)
  private double rating;

  @Column(name = "reviews_count", nullable = false)
  private int reviewsCount;

  @Column(name = "cover_pic")
  private String coverUrl;

  @OneToMany(
      mappedBy = "album",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @OrderBy("position ASC")
  private Set<Song> songs = new LinkedHashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "album_genre",
      joinColumns = @JoinColumn(name = "album_id"),
      inverseJoinColumns = @JoinColumn(name = "genre_id"))
  private Set<Genre> genres = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "album_artist",
      joinColumns = @JoinColumn(name = "album_id"),
      inverseJoinColumns = @JoinColumn(name = "artist_id"))
  private Set<Artist> artists = new HashSet<>();

  /**
   * Adds a new artist to the Album Entity
   *
   * @param artist the artist
   */
  public void addArtist(Artist artist) {
    this.artists.add(artist);
  }

  /**
   * Adds a new genre to the Album Entity
   *
   * @param genre the genre
   */
  public void addGenre(Genre genre) {
    this.genres.add(genre);
  }
}
