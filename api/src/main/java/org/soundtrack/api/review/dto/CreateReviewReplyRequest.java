package org.soundtrack.api.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewReplyRequest {

  @NotBlank(message = "Message is required")
  @Size(max = 1024, message = "Message cannot exceed 1024 characters")
  private String message;
}
