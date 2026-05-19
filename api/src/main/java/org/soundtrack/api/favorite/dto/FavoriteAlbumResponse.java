package org.soundtrack.api.favorite.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FavoriteAlbumResponse {

  private Long id;
  private String title;
  private String coverUrl;
  private LocalDate releaseDate;
  private List<String> artistNames;
}
