package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "user_follow",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_follow",
        columnNames = {"follower_id", "following_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFollow {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "follower_id", nullable = false)
  private User follower;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "following_id", nullable = false)
  private User following;

  @Column(name = "followed_at", nullable = false)
  private LocalDateTime followedAt;

  @PrePersist
  void prePersist() {
    followedAt = LocalDateTime.now();
  }
}
