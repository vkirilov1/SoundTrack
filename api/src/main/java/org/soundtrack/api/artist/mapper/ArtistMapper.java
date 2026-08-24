package org.soundtrack.api.artist.mapper;

import java.util.Comparator;
import java.util.Set;
import org.soundtrack.api.artist.dto.AlbumResponse;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.springframework.stereotype.Component;

@Component
public class ArtistMapper {

  public ArtistResponse toResponse(Artist artist, Set<Long> favoritedAlbumIds) {
    return new ArtistResponse(
        artist.getId(),
        artist.getArtistName(),
        artist.getCountry(),
        artist.getArtistType(),
        artist.getBiography(),
        artist.getArtistPic(),
        artist.getAlbums().stream()
            .sorted(
                Comparator.comparing(Album::getReleaseDate)
                    .reversed()
                    .thenComparing(Album::getTitle, String.CASE_INSENSITIVE_ORDER))
            .map(album -> toAlbumResponse(album, favoritedAlbumIds))
            .toList());
  }

  private AlbumResponse toAlbumResponse(Album album, Set<Long> favoritedAlbumIds) {
    return new AlbumResponse(
        album.getId(),
        album.getTitle(),
        album.getCoverUrl(),
        album.getReleaseDate(),
        album.getRating(),
        favoritedAlbumIds.contains(album.getId()));
  }
}
