// package org.soundtrack.domain.model;
//
// import jakarta.persistence.*;
// import java.util.ArrayList;
// import lombok.*;
//
// @Entity
// @Table(name = "user_list")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class UserList {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  private String name;
//
//  @Column(length = 1024)
//  private String description;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "owner_id")
//  private User owner;
//
//  @ManyToMany
//  @JoinTable(
//      name = "user_list_album",
//      joinColumns = @JoinColumn(name = "list_id"),
//      inverseJoinColumns = @JoinColumn(name = "album_id"))
//  private java.util.List<Album> albums = new ArrayList<>();
// }
