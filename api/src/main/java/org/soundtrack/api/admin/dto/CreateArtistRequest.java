package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateArtistRequest {

  @NotBlank(message = "Artist name is required")
  @Size(max = 255, message = "Artist name cannot exceed 255 characters")
  private String name;

  @NotBlank(message = "Country is required")
  private String country;

  @NotBlank(message = "Type is required")
  private String type;

  @Size(max = 3400, message = "Biography cannot exceed 3400 characters")
  private String biography;
}
