package org.soundtrack.api.chart.dto;

import java.time.LocalDate;
import java.util.List;
import org.soundtrack.api.album.dto.ArtistResponse;

public record AlbumSummaryResponse(
    Long id,
    String title,
    String coverUrl,
    LocalDate releaseDate,
    double rating,
    int reviewsCount,
    List<ArtistResponse> artists,
    List<String> genres,
    boolean favorited) {}
