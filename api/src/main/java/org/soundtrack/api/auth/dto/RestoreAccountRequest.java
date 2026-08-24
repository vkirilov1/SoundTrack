package org.soundtrack.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestoreAccountRequest {

  @NotBlank(message = "Restore token is missing")
  private String token;
}
