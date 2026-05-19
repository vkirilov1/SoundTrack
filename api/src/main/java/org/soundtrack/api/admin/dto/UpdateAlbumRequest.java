package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAlbumRequest {

  @NotBlank(message = "Title is required")
  @Size(max = 255, message = "Title cannot exceed 255 characters")
  private String title;

  private LocalDate releaseDate;

  private String coverUrl;
}
