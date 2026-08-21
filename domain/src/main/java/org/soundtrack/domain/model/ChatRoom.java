package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(
    name = "chat_room",
    indexes = {@Index(name = "idx_chat_room_topic", columnList = "topic_type, topic_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "name", nullable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(name = "topic_type", nullable = false, length = 10)
  private TopicType topicType;

  @Column(name = "topic_id", nullable = false)
  private Long topicId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "creator_id", nullable = false)
  private User creator;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "max_capacity", nullable = false)
  private int maxCapacity;

  @Column(name = "approval_required", nullable = false)
  private boolean approvalRequired;

  @ManyToMany
  @JoinTable(
      name = "chat_room_member",
      joinColumns = @JoinColumn(name = "chat_room_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  @Builder.Default
  private Set<User> members = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "chat_room_invite",
      joinColumns = @JoinColumn(name = "chat_room_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  @Builder.Default
  private Set<User> invitedUsers = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "chat_room_join_request",
      joinColumns = @JoinColumn(name = "chat_room_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  @Builder.Default
  private Set<User> joinRequests = new HashSet<>();
}
