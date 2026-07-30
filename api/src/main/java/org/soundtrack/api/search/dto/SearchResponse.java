package org.soundtrack.api.search.dto;

import java.util.List;

public record SearchResponse(
    List<SearchResultResponse> albums, List<SearchResultResponse> artists) {}
