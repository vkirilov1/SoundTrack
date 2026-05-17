package org.soundtrack.api.album.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;

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
    List<String> genres,
    List<SongResponse> songs) {}
