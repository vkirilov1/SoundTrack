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

  @Column(name = "description", columnDefinition = "TEXT", length = 2400)
  private String description;

  @OneToMany(
      mappedBy = "album",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @OrderBy("position ASC")
  private Set<Song> songs = new LinkedHashSet<>();

  @OneToMany(
      mappedBy = "album",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private Set<AlbumGenre> albumGenres = new HashSet<>();

  @OneToMany(
      mappedBy = "album",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private Set<AlbumArtist> albumArtists = new HashSet<>();

  /**
   * Adds a new artist to the Album Entity
   *
   * @param artist the artist
   * @param position the artist's MusicBrainz credit order (0 = primary artist)
   */
  public void addArtist(Artist artist, int position) {
    AlbumArtist link = new AlbumArtist();
    link.setAlbum(this);
    link.setArtist(artist);
    link.setPosition(position);
    this.albumArtists.add(link);
  }

  /**
   * Returns this album's artists ordered by MusicBrainz credit position (primary artist first),
   * falling back to alphabetical order for ties - e.g. rows imported before credit order was
   * tracked, which all default to position 0.
   */
  public List<Artist> getArtists() {
    return albumArtists.stream()
        .sorted(
            Comparator.comparingInt(AlbumArtist::getPosition)
                .thenComparing(
                    link -> link.getArtist().getArtistName(), String.CASE_INSENSITIVE_ORDER))
        .map(AlbumArtist::getArtist)
        .toList();
  }

  /**
   * Links a genre to this album with a relevance weight (MusicBrainz tag vote count).
   *
   * @param genre the genre
   * @param weight the tag's relevance weight for this album
   */
  public void addGenre(Genre genre, int weight) {
    AlbumGenre link = new AlbumGenre();
    link.setAlbum(this);
    link.setGenre(genre);
    link.setWeight(weight);
    this.albumGenres.add(link);
  }
}
