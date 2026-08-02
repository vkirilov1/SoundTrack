package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

/** Entity class for Artist object in db */
@Entity
@Getter
@Setter
@Table(name = "artist")
public class Artist {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "mbid", unique = true)
  private String mbid;

  @Column(name = "artist_name", nullable = false)
  private String artistName;

  @Column(name = "country")
  private String country;

  @Column(name = "artist_type")
  private String artistType;

  @Column(name = "biography", length = 3400)
  private String biography;

  @Column(name = "artist_pic", length = 512)
  private String artistPic;

  @OneToMany(mappedBy = "artist", fetch = FetchType.LAZY)
  private Set<SongArtist> songCredits = new HashSet<>();

  @OneToMany(mappedBy = "artist", fetch = FetchType.LAZY)
  private Set<AlbumArtist> albumCredits = new HashSet<>();

  public List<Song> getSongs() {
    return songCredits.stream().map(SongArtist::getSong).toList();
  }

  public List<Album> getAlbums() {
    return albumCredits.stream().map(AlbumArtist::getAlbum).toList();
  }
}
