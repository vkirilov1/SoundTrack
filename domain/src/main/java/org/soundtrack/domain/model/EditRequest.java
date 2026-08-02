package org.soundtrack.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * A user-submitted proposal to change an album's or artist's description, awaiting admin review.
 * Approved and rejected requests are kept (not deleted) as a review history.
 */
@Entity
@Table(name = "edit_request")
@Getter
@Setter
public class EditRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "target_type", nullable = false)
  private EditRequestTargetType targetType;

  @Column(name = "target_id", nullable = false)
  private Long targetId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "requested_by", nullable = false)
  private User requestedBy;

  @Column(name = "proposed_description", nullable = false)
  private String proposedDescription;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private EditRequestStatus status = EditRequestStatus.PENDING;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewed_by")
  private User reviewedBy;

  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();
}
