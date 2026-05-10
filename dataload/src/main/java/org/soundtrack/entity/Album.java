package org.soundtrack.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

  @Column(name = "mbid", unique = true)
  private String mbid;

  @Column(name = "releaseid", unique = true)
  private String releaseid;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "release_date", nullable = false)
  private LocalDate releaseDate;

  @Column(name = "cover_pic")
  private String coverUrl;

  @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Song> songs = new ArrayList<>();

  @ManyToMany
  @JoinTable(
      name = "album_genre",
      joinColumns = @JoinColumn(name = "album_id"),
      inverseJoinColumns = @JoinColumn(name = "genre_id"))
  private Set<Genre> genres = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "album_artist",
      joinColumns = @JoinColumn(name = "album_id"),
      inverseJoinColumns = @JoinColumn(name = "artist_id"))
  private List<Artist> artists = new ArrayList<>();

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
    genre.getAlbums().add(this);
  }
}
