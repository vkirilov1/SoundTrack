package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "chat_room_report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomReport {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reporter_id")
  private User reporter;

  @Column(name = "room_id", nullable = false)
  private Long roomId;

  @Column(name = "room_name", nullable = false)
  private String roomName;

  @Column(name = "topic_name")
  private String topicName;

  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false, length = 20)
  private ChatReportCategory category;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private ChatReportStatus status = ChatReportStatus.OPEN;

  /** Set the moment an admin joins the room to investigate. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "handled_by")
  private User handledBy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resolved_by")
  private User resolvedBy;

  @Enumerated(EnumType.STRING)
  @Column(name = "resolution", length = 20)
  private ChatReportResolution resolution;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "resolved_at")
  private LocalDateTime resolvedAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
  }
}
