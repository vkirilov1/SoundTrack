package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "user_list")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserList {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "name", nullable = false, length = 255)
  private String name;

  @Column(name = "description", length = 1024)
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  private User owner;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "user_list_album",
      joinColumns = @JoinColumn(name = "list_id"),
      inverseJoinColumns = @JoinColumn(name = "album_id"))
  @Builder.Default
  private List<Album> albums = new ArrayList<>();
}
