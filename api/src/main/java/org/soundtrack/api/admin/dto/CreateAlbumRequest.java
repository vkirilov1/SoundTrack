package org.soundtrack.api.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAlbumRequest {

  @NotBlank(message = "Title is required")
  @Size(max = 255, message = "Title cannot exceed 255 characters")
  private String title;

  @NotNull(message = "Release date is required")
  private LocalDate releaseDate;

  @Size(max = 2400, message = "Description cannot exceed 2400 characters")
  private String description;

  @NotEmpty(message = "At least one artist is required")
  private List<Long> artistIds;

  private List<String> genres;

  @Valid private List<CreateSongRequest> songs;
}
