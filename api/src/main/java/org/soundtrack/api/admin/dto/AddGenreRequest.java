package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddGenreRequest {

  @NotBlank(message = "Genre is required")
  @Size(max = 255, message = "Genre cannot exceed 255 characters")
  private String genre;
}
