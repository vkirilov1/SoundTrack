package org.soundtrack.api.userlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserListRequest {

  @NotBlank(message = "List name is required")
  @Size(max = 255, message = "Name cannot exceed 255 characters")
  private String name;

  @Size(max = 1024, message = "Description cannot exceed 1024 characters")
  private String description;
}
