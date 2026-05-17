package org.soundtrack.api.review.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewReplyResponse {

  private Long id;

  private String message;

  private boolean edited;

  private String username;

  private LocalDateTime createdAt;
}
