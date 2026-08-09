package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/**
 * A notification for {@code recipient}, triggered by {@code actor}. {@code entityId} is an
 * optional, type-dependent reference (e.g. an album/review/list id) the frontend uses to deep-link
 * - its meaning depends on {@code type}.
 */
@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_id", nullable = false)
  private User recipient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id", nullable = false)
  private User actor;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false)
  private NotificationType type;

  @Column(name = "entity_id")
  private Long entityId;

  /** Optional freeform label snapshotted at creation time (e.g. an album title), for display. */
  @Column(name = "context")
  private String context;

  @Column(name = "read_flag", nullable = false)
  private boolean read;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void prePersist() {
    createdAt = LocalDateTime.now();
  }
}
