package org.soundtrack.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

  @Pattern(
      regexp = "^[^@\\s]+@[^@\\s.]+\\.[^@\\s]+$",
      message = "Email must follow the format Text@Text.Text")
  @NotBlank(message = "Email cannot be blank")
  private String email;
}
