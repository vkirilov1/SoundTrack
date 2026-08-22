package org.soundtrack.api.drops.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.soundtrack.domain.model.AlbumSuggestionStatus;

public record AlbumSuggestionResponse(
    Long id,
    String submittedByUsername,
    String title,
    String artistName,
    LocalDate releaseDate,
    String note,
    AlbumSuggestionStatus status,
    String reviewedByUsername,
    LocalDateTime reviewedAt,
    LocalDateTime createdAt) {}
