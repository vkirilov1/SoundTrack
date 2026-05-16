// package org.soundtrack.domain.model;
//
// import jakarta.persistence.*;
// import lombok.*;
//
// @Entity
// @Table(name = "favorite_song")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class FavoriteSong {
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
//  @JoinColumn(name = "song_id")
//  private Song song;
// }
