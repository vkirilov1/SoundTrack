package org.soundtrack.api.userlist.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserListSummaryResponse {

  private Long id;
  private String name;
  private String description;
}
