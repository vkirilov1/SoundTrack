// package org.soundtrack.domain.model;
//
// import jakarta.persistence.*;
// import lombok.*;
//
// @Entity
// @Table(name = "chat_room")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class ChatRoom {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  @Column(nullable = false)
//  private String name;
//
//  @ManyToMany
//  @JoinTable(
//      name = "chat_room_member",
//      joinColumns = @JoinColumn(name = "chat_room_id"),
//      inverseJoinColumns = @JoinColumn(name = "user_id"))
//  private java.util.Set<User> members = new java.util.HashSet<>();
// }
