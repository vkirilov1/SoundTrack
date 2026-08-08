package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSongRequest {

  @Positive(message = "Position must be required")
  @Min(1)
  private Short position;

  @Size(max = 255, message = "Title cannot exceed 255 characters")
  private String title;

  @Positive(message = "Duration must be positive")
  private Integer durationSeconds;
}
