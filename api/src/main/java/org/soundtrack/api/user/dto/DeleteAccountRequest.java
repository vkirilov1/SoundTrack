package org.soundtrack.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeleteAccountRequest {

  @NotBlank(message = "Password cannot be blank")
  private String password;
}
