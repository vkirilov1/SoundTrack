package org.soundtrack.api.search.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchResultResponse {

  private Long id;
  private SearchResultType type;
  private String title;
  private String subtitle;
  private String imageUrl;
}
