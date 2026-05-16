package org.soundtrack.api.album.dto;

import java.util.List;

public record SongResponse(
    Long id, Short position, String title, Long durationSeconds, List<ArtistResponse> artists) {}
