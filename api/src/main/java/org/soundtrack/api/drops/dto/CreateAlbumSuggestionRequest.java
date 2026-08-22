package org.soundtrack.api.drops.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateAlbumSuggestionRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank @Size(max = 255) String artistName,
    LocalDate releaseDate,
    @Size(max = 500) String note) {}
