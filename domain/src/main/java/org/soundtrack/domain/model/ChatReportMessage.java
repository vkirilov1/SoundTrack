package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "chat_report_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatReportMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "report_id", nullable = false)
  private ChatRoomReport report;

  @Column(name = "sender_username", nullable = false)
  private String senderUsername;

  @Column(name = "content", nullable = false, length = 1000)
  private String content;

  @Column(name = "sent_at", nullable = false)
  private LocalDateTime sentAt;
}
