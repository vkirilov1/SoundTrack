// package org.soundtrack.domain.model;
//
// import jakarta.persistence.*;
// import lombok.*;
//
// @Entity
// @Table(name = "favorite_album")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class FavoriteAlbum {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "user_id")
//  private User user;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "album_id")
//  private Album album;
// }
