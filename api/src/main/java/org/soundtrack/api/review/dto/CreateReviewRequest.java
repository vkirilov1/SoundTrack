package org.soundtrack.api.review.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {

  @DecimalMin(value = "0.0", message = "Rating must be at least 0")
  @DecimalMax(value = "5.0", message = "Rating cannot exceed 5")
  @NotNull(message = "Rating cannot be null")
  private double rating;

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Comment is required")
  @Size(min = 25, max = 3400, message = "Comment must be at least 25 characters")
  private String comment;
}
