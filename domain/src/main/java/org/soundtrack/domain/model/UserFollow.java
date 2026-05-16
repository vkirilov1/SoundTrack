// package org.soundtrack.domain.model;
//
// import jakarta.persistence.*;
// import lombok.*;
//
// @Entity
// @Table(name = "user_follow")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class UserFollow {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "follower_id")
//  private User follower;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "following_id")
//  private User following;
// }
