package org.soundtrack.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

  @Size(min = 1, max = 20, message = "Username must be between 1 and 20 characters")
  @NotBlank(message = "Username cannot be blank")
  private String username;

  @Pattern(
      regexp = "^[^@\\s]+@[^@\\s.]+\\.[^@\\s]+$",
      message = "Email must follow the format Text@Text.Text")
  @NotBlank(message = "Email cannot be blank")
  private String email;

  @Pattern(
      regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
      message =
          "Password must be at least 8 characters long, contain at least one digit, one lowercase letter, one uppercase letter, one special character (@#$%^&+=), and no whitespaces")
  @NotBlank(message = "Password cannot be blank")
  private String password;
}
