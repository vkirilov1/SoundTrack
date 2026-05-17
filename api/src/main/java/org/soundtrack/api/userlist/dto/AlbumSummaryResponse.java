package org.soundtrack.api.userlist.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AlbumSummaryResponse {

  private Long id;
  private String title;
  private String coverUrl;
  private LocalDate releaseDate;
  private List<String> artistNames;
}
