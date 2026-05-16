package org.soundtrack.api.album.dto;

import java.time.LocalDate;
import java.util.List;

public record AlbumResponse(
    Long id,
    String title,
    String coverUrl,
    LocalDate releaseDate,
    double rating,
    int reviewsCount,
    List<ArtistResponse> artists,
    List<String> genres,
    List<SongResponse> songs) {}
