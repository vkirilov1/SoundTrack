package org.soundtrack.api.album.mapper;

import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.dto.ArtistResponse;
import org.soundtrack.api.album.dto.SongResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.Song;
import org.springframework.stereotype.Component;

@Component
public class AlbumMapper {

  public AlbumResponse toResponse(Album album) {

    return new AlbumResponse(
        album.getId(),
        album.getTitle(),
        album.getCoverUrl(),
        album.getReleaseDate(),
        album.getRating(),
        album.getReviewsCount(),
        album.getArtists().stream().map(this::toArtistResponse).toList(),
        album.getGenres().stream().map(Genre::getGenre).toList(),
        album.getSongs().stream().map(this::toSongResponse).toList());
  }

  private ArtistResponse toArtistResponse(Artist artist) {
    return new ArtistResponse(artist.getId(), artist.getArtistName());
  }

  private SongResponse toSongResponse(Song song) {

    return new SongResponse(
        song.getId(),
        song.getPosition(),
        song.getTitle(),
        song.getDuration().toSeconds(),
        song.getArtists().stream().map(this::toArtistResponse).toList());
  }
}
