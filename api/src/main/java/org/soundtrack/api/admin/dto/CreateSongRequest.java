package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSongRequest {

  @NotBlank(message = "Song title is required")
  @Size(max = 255, message = "Song title cannot exceed 255 characters")
  private String title;

  @NotNull(message = "Song duration is required")
  @Positive(message = "Song duration must be positive")
  private Integer durationSeconds;

  @NotEmpty(message = "Each song needs at least one artist")
  private List<Long> artistIds;
}
