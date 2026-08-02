package org.soundtrack.api.editrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitEditRequestRequest {

  @NotBlank(message = "Description is required")
  @Size(max = 3400, message = "Description cannot exceed 3400 characters")
  private String description;
}
