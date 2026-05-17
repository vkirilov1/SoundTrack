package org.soundtrack.api.userlist.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserListDetailResponse {

  private Long id;
  private String name;
  private String description;
  private String ownerUsername;
  private List<AlbumSummaryResponse> albums;
}
