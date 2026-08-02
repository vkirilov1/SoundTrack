package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateArtistRequest {

  @NotBlank(message = "Artist name is required")
  @Size(max = 255, message = "Artist name cannot exceed 255 characters")
  private String artistName;

  private String country;

  private String artistType;

  @Size(max = 3400, message = "Biography cannot exceed 3400 characters")
  private String biography;
}
