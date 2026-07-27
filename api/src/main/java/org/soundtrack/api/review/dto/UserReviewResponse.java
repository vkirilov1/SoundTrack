package org.soundtrack.api.review.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserReviewResponse {

  private Long id;

  private double rating;

  private String title;

  private String comment;

  private boolean edited;

  private LocalDateTime createdAt;

  private Long albumId;

  private String albumTitle;

  private String albumCoverUrl;
}
