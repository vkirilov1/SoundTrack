package org.soundtrack.api.favorite.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FavoriteSongResponse {

  private Long id;
  private String title;
  private String duration;
  private Short position;
  private Long albumId;
  private String albumTitle;
  private String albumCoverUrl;
  private List<String> artistNames;
}
