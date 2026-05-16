package org.soundtrack.api.artist.mapper;

import org.soundtrack.api.artist.dto.AlbumResponse;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.springframework.stereotype.Component;

@Component
public class ArtistMapper {

  public ArtistResponse toResponse(Artist artist) {
    return new ArtistResponse(
        artist.getId(),
        artist.getArtistName(),
        artist.getCountry(),
        artist.getArtistType(),
        artist.getBiography(),
        artist.getArtistPic(),
        artist.getAlbums().stream().map(this::toAlbumResponse).toList());
  }

  private AlbumResponse toAlbumResponse(Album album) {
    return new AlbumResponse(
        album.getId(), album.getTitle(), album.getCoverUrl(), album.getReleaseDate());
  }
}
