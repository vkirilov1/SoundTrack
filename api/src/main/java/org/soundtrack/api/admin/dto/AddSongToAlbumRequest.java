package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddSongToAlbumRequest {

  @NotNull(message = "Position is required")
  @Positive(message = "Position must be positive")
  private Short position;

  @NotBlank(message = "Song title is required")
  @Size(max = 255, message = "Song title cannot exceed 255 characters")
  private String title;

  @NotNull(message = "Duration is required")
  @Positive(message = "Duration must be positive")
  private Integer durationSeconds;
}
