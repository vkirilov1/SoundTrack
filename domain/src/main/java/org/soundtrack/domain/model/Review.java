package org.soundtrack.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "rating", nullable = false)
  private double rating;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "review_comment", length = 7000, nullable = false)
  private String comment;

  @Column(name = "edited")
  private boolean edited;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id", nullable = false)
  private Album album;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ReviewReply> replies = new ArrayList<>();

  @Column(name = "created_at")
  private LocalDateTime createdAt;
}
