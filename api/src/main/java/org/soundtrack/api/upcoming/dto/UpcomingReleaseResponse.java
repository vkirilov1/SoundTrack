package org.soundtrack.api.upcoming.dto;

import java.time.LocalDate;
import java.util.List;

public record UpcomingReleaseResponse(
    Long id,
    String title,
    String coverUrl,
    LocalDate releaseDate,
    List<String> artistNames,
    boolean publishable) {}
