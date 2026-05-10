package org.soundtrack.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

/** Entity class for Genre object in db */
@Entity
@Getter
@Setter
@Table(name = "genre")
public class Genre {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "genre", unique = true, nullable = false)
  private String genre;

  @ManyToMany(mappedBy = "genres")
  private Set<Album> albums = new HashSet<>();
}
