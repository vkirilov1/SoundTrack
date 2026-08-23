package org.soundtrack.api.home.dto;

import java.util.List;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;

public record GenrePickResponse(String genre, List<AlbumSummaryResponse> albums) {}
