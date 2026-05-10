package org.soundtrack.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
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

  @Column(unique = true)
  private String mbid;

  @Column(name = "artist_name", nullable = false)
  private String artistName;

  @Column(name = "country")
  private String country;

  @Column(name = "artist_type")
  private String artistType;

  @Column(length = 1024)
  private String biography;

  @Column(name = "artist_pic", length = 512)
  private String artistPic;

  @ManyToMany(mappedBy = "artists")
  private List<Song> songs = new ArrayList<>();
}
