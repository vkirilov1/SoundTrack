package org.soundtrack.api.userlist.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserListSummaryResponse {

  private Long id;
  private String name;
  private String description;
  private int itemCount;
  private String coverUrl;

  @Builder.Default private boolean containsAlbum = false;
}
