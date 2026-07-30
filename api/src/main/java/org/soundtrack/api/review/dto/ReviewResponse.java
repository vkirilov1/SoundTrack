package org.soundtrack.api.review.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {

  private Long id;

  private double rating;

  private String title;

  private String comment;

  private String username;

  private Long userId;

  private String profilePictureUrl;

  private LocalDateTime createdAt;
}
