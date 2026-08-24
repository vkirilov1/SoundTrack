package org.soundtrack.api.favorite.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.FavoriteAlbum;
import org.soundtrack.domain.model.FavoriteSong;
import org.soundtrack.domain.model.Song;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.FavoriteSongRepository;
import org.soundtrack.domain.repository.SongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private FavoriteSongRepository favoriteSongRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private SongRepository songRepository;
  @Mock private UserRepository userRepository;
  @Mock private ChartMapper chartMapper;
  @Mock private CurrentUserService currentUserService;

  private FavoriteService favoriteService;
  private final User user = User.builder().id(9L).build();

  @BeforeEach
  void setUp() {
    favoriteService =
        new FavoriteService(
            favoriteAlbumRepository,
            favoriteSongRepository,
            albumRepository,
            songRepository,
            userRepository,
            chartMapper,
            currentUserService);
  }

  private Song song(long id) {
    Song song = new Song();
    song.setId(id);
    song.setDuration(Duration.ofSeconds(100));
    Album album = new Album();
    album.setId(1L);
    song.setAlbum(album);
    return song;
  }

  @Test
  void addFavoriteAlbumRejectsWhenAlreadyFavorited() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteAlbumRepository.existsByUserIdAndAlbumId(9L, 1L)).thenReturn(true);

    assertThatThrownBy(() -> favoriteService.addFavoriteAlbum(1L))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void addFavoriteAlbumRequiresAnExistingAlbum() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteAlbumRepository.existsByUserIdAndAlbumId(9L, 1L)).thenReturn(false);
    when(albumRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> favoriteService.addFavoriteAlbum(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void addFavoriteAlbumFavoritesEveryTrackNotAlreadyFavorited() {
    Album album = new Album();
    album.setId(1L);
    Song alreadyFavorited = song(10L);
    Song notYetFavorited = song(11L);

    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteAlbumRepository.existsByUserIdAndAlbumId(9L, 1L)).thenReturn(false);
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
    when(songRepository.findByAlbumId(1L)).thenReturn(List.of(alreadyFavorited, notYetFavorited));
    when(favoriteSongRepository.existsByUserIdAndSongId(9L, 10L)).thenReturn(true);
    when(favoriteSongRepository.existsByUserIdAndSongId(9L, 11L)).thenReturn(false);

    favoriteService.addFavoriteAlbum(1L);

    verify(favoriteAlbumRepository).save(any(FavoriteAlbum.class));
    verify(favoriteSongRepository, times(1)).save(any(FavoriteSong.class));
  }

  @Test
  void removeFavoriteAlbumRequiresAnExistingFavorite() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteAlbumRepository.findByUserIdAndAlbumId(9L, 1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> favoriteService.removeFavoriteAlbum(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeFavoriteAlbumAlsoRemovesItsTracksFavorites() {
    FavoriteAlbum favoriteAlbum = FavoriteAlbum.builder().id(1L).build();
    Song trackedSong = song(10L);

    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteAlbumRepository.findByUserIdAndAlbumId(9L, 1L))
        .thenReturn(Optional.of(favoriteAlbum));
    when(songRepository.findByAlbumId(1L)).thenReturn(List.of(trackedSong));
    FavoriteSong favoriteSong = FavoriteSong.builder().id(1L).build();
    when(favoriteSongRepository.findByUserIdAndSongId(9L, 10L))
        .thenReturn(Optional.of(favoriteSong));

    favoriteService.removeFavoriteAlbum(1L);

    verify(favoriteAlbumRepository).delete(favoriteAlbum);
    verify(favoriteSongRepository).delete(favoriteSong);
  }

  @Test
  void getFavoriteAlbumsByUserRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> favoriteService.getFavoriteAlbumsByUser(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getFavoriteAlbumsByUserSkipsViewerFavoritedLookupForAnonymousViewer() {
    Album album = new Album();
    album.setId(1L);
    FavoriteAlbum favoriteAlbum = FavoriteAlbum.builder().id(1L).album(album).build();

    when(userRepository.existsById(1L)).thenReturn(true);
    when(favoriteAlbumRepository.findByUserId(any(), any()))
        .thenReturn(new PageImpl<>(List.of(favoriteAlbum)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    favoriteService.getFavoriteAlbumsByUser(1L, 0, 20);

    verify(favoriteAlbumRepository, never())
        .findFavoritedAlbumIdsByUserIdAndAlbumIdIn(any(), any());
    verify(chartMapper).toSummary(album, false);
  }

  @Test
  void addFavoriteSongRejectsWhenAlreadyFavorited() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteSongRepository.existsByUserIdAndSongId(9L, 10L)).thenReturn(true);

    assertThatThrownBy(() -> favoriteService.addFavoriteSong(10L))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void addFavoriteSongRequiresAnExistingSong() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteSongRepository.existsByUserIdAndSongId(9L, 10L)).thenReturn(false);
    when(songRepository.findById(10L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> favoriteService.addFavoriteSong(10L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeFavoriteSongRequiresAnExistingFavorite() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(favoriteSongRepository.findByUserIdAndSongId(9L, 10L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> favoriteService.removeFavoriteSong(10L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getFavoriteSongsByUserRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> favoriteService.getFavoriteSongsByUser(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
