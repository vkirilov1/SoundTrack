package org.soundtrack.api.artist.dto;

import java.time.LocalDate;

public record AlbumResponse(
    Long id,
    String title,
    String coverUrl,
    LocalDate releaseDate,
    double rating,
    boolean favorited) {}
