package org.soundtrack.api.album.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record SongResponse(
    Long id,
    Short position,
    String title,
    @Schema(description = "Track duration in seconds") Long durationSeconds,
    List<ArtistResponse> artists) {}
