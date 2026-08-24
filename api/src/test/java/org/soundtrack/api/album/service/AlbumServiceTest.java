package org.soundtrack.api.album.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.FavoriteSongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

  @Mock private AlbumRepository albumRepository;
  @Mock private AlbumMapper albumMapper;
  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private FavoriteSongRepository favoriteSongRepository;
  @Mock private CurrentUserService currentUserService;

  private AlbumService albumService;

  @BeforeEach
  void setUp() {
    albumService =
        new AlbumService(
            albumRepository,
            albumMapper,
            favoriteAlbumRepository,
            favoriteSongRepository,
            currentUserService);
  }

  private Album album(long id, LocalDate releaseDate, int reviewsCount) {
    Album album = new Album();
    album.setId(id);
    album.setReleaseDate(releaseDate);
    album.setReviewsCount(reviewsCount);
    return album;
  }

  @Test
  void throwsWhenAlbumNotFound() {
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> albumService.getAlbumById(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void anonymousCallerNeverFavoritedAndSkipsChartLookupWhenUnreviewed() {
    Album album = album(1L, LocalDate.of(2020, 1, 1), 0);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    albumService.getAlbumById(1L);

    verify(albumMapper).toResponse(album, false, Set.of(), null);
    verify(albumRepository, never()).findGlobalAverageRating();
  }

  @Test
  void authenticatedCallerFavoritedFlagsComeFromRepository() {
    Album album = album(1L, LocalDate.of(2020, 1, 1), 0);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(9L);
    when(favoriteAlbumRepository.existsByUserIdAndAlbumId(9L, 1L)).thenReturn(true);
    when(favoriteSongRepository.findFavoritedSongIdsByUserIdAndAlbumId(9L, 1L))
        .thenReturn(Set.of(5L));

    albumService.getAlbumById(1L);

    verify(albumMapper).toResponse(album, true, Set.of(5L), null);
  }

  @Test
  void yearRankIsAlbumsOneBasedPositionInItsYearChart() {
    Album album = album(1L, LocalDate.of(2020, 6, 1), 10);
    Album higherRanked = album(2L, LocalDate.of(2020, 3, 1), 50);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);
    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            eq(LocalDate.of(2020, 1, 1)),
            eq(LocalDate.of(2020, 12, 31)),
            anyDouble(),
            anyDouble(),
            any()))
        .thenReturn(new PageImpl<>(List.of(higherRanked, album)));

    albumService.getAlbumById(1L);

    verify(albumMapper).toResponse(album, false, Set.of(), 2);
  }

  @Test
  void yearRankIsNullWhenAlbumIsMissingFromItsOwnYearChart() {
    Album album = album(1L, LocalDate.of(2020, 6, 1), 10);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);
    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    Page<Album> emptyChart = new PageImpl<>(List.of());
    when(albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            any(), any(), anyDouble(), anyDouble(), any()))
        .thenReturn(emptyChart);

    albumService.getAlbumById(1L);

    verify(albumMapper).toResponse(album, false, Set.of(), null);
  }
}
