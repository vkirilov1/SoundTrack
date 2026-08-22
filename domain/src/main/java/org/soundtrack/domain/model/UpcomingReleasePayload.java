package org.soundtrack.domain.model;

import java.util.List;

/**
 * Everything about a not-yet-published release beyond title/releaseDate/cover (which live as plain
 * columns on {@link UpcomingRelease} for querying/sorting). Stored as a single JSON column rather
 * than a mirrored relational graph - none of it needs to be independently queryable before publish,
 * it only needs to round-trip faithfully into a real {@code Album} once promoted
 */
public record UpcomingReleasePayload(
    String description, List<ArtistCredit> artists, List<String> genres, List<SongDraft> songs) {

  public record ArtistCredit(Long id, String name) {}

  public record SongDraft(String title, int durationSeconds, List<ArtistCredit> artists) {}
}
