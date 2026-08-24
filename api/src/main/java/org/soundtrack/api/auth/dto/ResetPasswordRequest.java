package org.soundtrack.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

  @NotBlank(message = "Reset token is missing")
  private String token;

  @Pattern(
      regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
      message =
          "Password must be at least 8 characters long, contain at least one digit, one lowercase letter, one uppercase letter, one special character (@#$%^&+=), and no whitespaces")
  @NotBlank(message = "Password cannot be blank")
  private String newPassword;
}
