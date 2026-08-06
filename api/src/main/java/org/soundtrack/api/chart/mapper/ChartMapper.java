package org.soundtrack.api.chart.mapper;

import java.util.Comparator;
import org.soundtrack.api.album.dto.ArtistResponse;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumGenre;
import org.springframework.stereotype.Component;

@Component
public class ChartMapper {

  private static final int MAX_GENRES = 3;

  public AlbumSummaryResponse toSummary(Album album, boolean favorited) {
    return new AlbumSummaryResponse(
        album.getId(),
        album.getTitle(),
        album.getCoverUrl(),
        album.getReleaseDate(),
        album.getRating(),
        album.getReviewsCount(),
        album.getArtists().stream()
            .map(artist -> new ArtistResponse(artist.getId(), artist.getArtistName()))
            .toList(),
        album.getAlbumGenres().stream()
            .sorted(
                Comparator.comparingInt(AlbumGenre::getWeight)
                    .reversed()
                    .thenComparing(AlbumGenre::getId))
            .map(link -> link.getGenre().getGenre())
            .limit(MAX_GENRES)
            .toList(),
        favorited);
  }
}
