package org.soundtrack.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

  @Size(min = 1, max = 20, message = "Username must be between 1 and 20 characters")
  @NotBlank(message = "Username cannot be blank")
  private String username;

  @Size(max = 1024, message = "Bio cannot exceed 1024 characters")
  private String bio;
}
