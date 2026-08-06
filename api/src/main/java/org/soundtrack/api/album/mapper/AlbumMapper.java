package org.soundtrack.api.album.mapper;

import java.util.Comparator;
import java.util.Set;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.dto.ArtistResponse;
import org.soundtrack.api.album.dto.SongResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumGenre;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Song;
import org.springframework.stereotype.Component;

@Component
public class AlbumMapper {

  /**
   * Maps an album to its response DTO.
   *
   * @param album the album
   * @param favorited whether the current caller has this album favorited (false for anonymous
   *     callers or contexts with no meaningful "current user", e.g. admin edits)
   * @param favoritedSongIds ids of this album's songs the current caller has favorited
   * @param yearRank this album's rank on its release year's chart, or null (see {@link
   *     org.soundtrack.api.album.service.AlbumService})
   */
  public AlbumResponse toResponse(
      Album album, boolean favorited, Set<Long> favoritedSongIds, Integer yearRank) {

    return new AlbumResponse(
        album.getId(),
        album.getTitle(),
        album.getCoverUrl(),
        album.getReleaseDate(),
        album.getRating(),
        album.getReviewsCount(),
        album.getArtists().stream().map(this::toArtistResponse).toList(),
        album.getAlbumGenres().stream()
            .sorted(
                Comparator.comparingInt(AlbumGenre::getWeight)
                    .reversed()
                    .thenComparing(AlbumGenre::getId))
            .map(link -> link.getGenre().getGenre())
            .toList(),
        album.getSongs().stream().map(song -> toSongResponse(song, favoritedSongIds)).toList(),
        album.getDescription(),
        favorited,
        yearRank);
  }

  private ArtistResponse toArtistResponse(Artist artist) {
    return new ArtistResponse(artist.getId(), artist.getArtistName());
  }

  private SongResponse toSongResponse(Song song, Set<Long> favoritedSongIds) {

    return new SongResponse(
        song.getId(),
        song.getPosition(),
        song.getTitle(),
        song.getDuration().toSeconds(),
        song.getArtists().stream().map(this::toArtistResponse).toList(),
        favoritedSongIds.contains(song.getId()));
  }
}
