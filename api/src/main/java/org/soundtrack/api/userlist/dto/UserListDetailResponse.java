package org.soundtrack.api.userlist.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;

@Getter
@Builder
public class UserListDetailResponse {

  private Long id;
  private String name;
  private String description;
  private Long ownerId;
  private String ownerUsername;
  private LocalDateTime createdAt;
  private List<AlbumSummaryResponse> albums;
}
