package org.soundtrack.api.favorite.service;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.ArtistResponse;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.favorite.dto.FavoriteSongResponse;
import org.soundtrack.domain.model.*;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.FavoriteSongRepository;
import org.soundtrack.domain.repository.SongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final FavoriteSongRepository favoriteSongRepository;
  private final AlbumRepository albumRepository;
  private final SongRepository songRepository;
  private final UserRepository userRepository;
  private final ChartMapper chartMapper;
  private final CurrentUserService currentUserService;

  @Transactional
  public void addFavoriteAlbum(Long albumId) {
    User user = currentUserService.getAuthenticatedUser();

    if (favoriteAlbumRepository.existsByUserIdAndAlbumId(user.getId(), albumId)) {
      throw new ResourceExistsException("Album is already in favorites");
    }

    Album album =
        albumRepository
            .findById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    favoriteAlbumRepository.save(FavoriteAlbum.builder().user(user).album(album).build());

    // Favoriting an album favorites its whole tracklist too
    for (Song song : songRepository.findByAlbumId(albumId)) {
      if (!favoriteSongRepository.existsByUserIdAndSongId(user.getId(), song.getId())) {
        favoriteSongRepository.save(FavoriteSong.builder().user(user).song(song).build());
      }
    }
  }

  @Transactional
  public void removeFavoriteAlbum(Long albumId) {
    User user = currentUserService.getAuthenticatedUser();

    FavoriteAlbum favorite =
        favoriteAlbumRepository
            .findByUserIdAndAlbumId(user.getId(), albumId)
            .orElseThrow(() -> new ResourceNotFoundException("Album not found in favorites"));

    favoriteAlbumRepository.delete(favorite);

    for (Song song : songRepository.findByAlbumId(albumId)) {
      favoriteSongRepository
          .findByUserIdAndSongId(user.getId(), song.getId())
          .ifPresent(favoriteSongRepository::delete);
    }
  }

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getFavoriteAlbumsByUser(
      Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }
    return getFavoriteAlbums(userId, page, size);
  }

  @Transactional
  public void addFavoriteSong(Long songId) {
    User user = currentUserService.getAuthenticatedUser();

    if (favoriteSongRepository.existsByUserIdAndSongId(user.getId(), songId)) {
      throw new ResourceExistsException("Song is already in favorites");
    }

    Song song =
        songRepository
            .findById(songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + songId));

    favoriteSongRepository.save(FavoriteSong.builder().user(user).song(song).build());
  }

  @Transactional
  public void removeFavoriteSong(Long songId) {
    User user = currentUserService.getAuthenticatedUser();

    FavoriteSong favorite =
        favoriteSongRepository
            .findByUserIdAndSongId(user.getId(), songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found in favorites"));

    favoriteSongRepository.delete(favorite);
  }

  @Transactional(readOnly = true)
  public PagedResponse<FavoriteSongResponse> getFavoriteSongsByUser(
      Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }
    return getFavoriteSongs(userId, page, size);
  }

  private PagedResponse<AlbumSummaryResponse> getFavoriteAlbums(Long userId, int page, int size) {
    Page<FavoriteAlbum> favPage =
        favoriteAlbumRepository.findByUserId(
            userId, PageRequest.of(page, size, Sort.by("id").ascending()));

    List<Album> albums = favPage.getContent().stream().map(FavoriteAlbum::getAlbum).toList();

    Long viewerId = currentUserService.getAuthenticatedUserIdOrNull();
    Set<Long> viewerFavoritedIds =
        viewerId != null && !albums.isEmpty()
            ? favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(
                viewerId, albums.stream().map(Album::getId).collect(Collectors.toSet()))
            : Set.of();

    List<AlbumSummaryResponse> content =
        albums.stream()
            .map(album -> chartMapper.toSummary(album, viewerFavoritedIds.contains(album.getId())))
            .toList();

    return new PagedResponse<>(
        content, page, size, favPage.getTotalElements(), favPage.getTotalPages());
  }

  private PagedResponse<FavoriteSongResponse> getFavoriteSongs(Long userId, int page, int size) {
    Page<FavoriteSong> favPage =
        favoriteSongRepository.findByUserId(
            userId, PageRequest.of(page, size, Sort.by("id").ascending()));

    List<FavoriteSongResponse> content =
        favPage.getContent().stream().map(fav -> toSongResponse(fav.getSong())).toList();

    return new PagedResponse<>(
        content, page, size, favPage.getTotalElements(), favPage.getTotalPages());
  }

  private FavoriteSongResponse toSongResponse(Song song) {
    Duration d = song.getDuration();
    String formatted = String.format("%d:%02d", d.toMinutes(), d.toSecondsPart());

    return FavoriteSongResponse.builder()
        .id(song.getId())
        .title(song.getTitle())
        .duration(formatted)
        .position(song.getPosition())
        .albumId(song.getAlbum().getId())
        .albumTitle(song.getAlbum().getTitle())
        .albumCoverUrl(song.getAlbum().getCoverUrl())
        .artists(
            song.getArtists().stream()
                .map(artist -> new ArtistResponse(artist.getId(), artist.getArtistName()))
                .toList())
        .build();
  }
}
