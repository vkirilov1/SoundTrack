package org.soundtrack.api.album.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import org.soundtrack.api.chart.WeightedRating;

public record AlbumResponse(
    Long id,
    String title,
    @Schema(
            description =
                "Filename of the cover image. Fetch via GET /api/images/covers/{coverUrl}")
        String coverUrl,
    LocalDate releaseDate,
    @Schema(description = "Average user rating, 0.0–5.0") double rating,
    int reviewsCount,
    List<ArtistResponse> artists,
    @Schema(description = "Genre names, ordered by relevance weight, highest first")
        List<String> genres,
    List<SongResponse> songs,
    @Schema(description = "User-facing album description, null until one is written")
        String description,
    @Schema(description = "Whether the current authenticated user has favorited this album")
        boolean favorited,
    @Schema(
            description =
                "This album's rank on its release year's chart (1 = highest), null if unreviewed"
                    + " or outside the chart's top "
                    + WeightedRating.MAX_CHART_RESULTS)
        Integer yearRank) {}
