package org.soundtrack.api.chart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chart.WeightedRating;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class ChartServiceTest {

  @Mock private AlbumRepository albumRepository;
  @Mock private ChartMapper chartMapper;
  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private CurrentUserService currentUserService;

  private ChartService chartService;

  @BeforeEach
  void setUp() {
    chartService =
        new ChartService(albumRepository, chartMapper, favoriteAlbumRepository, currentUserService);
  }

  private Album album(long id) {
    Album album = new Album();
    album.setId(id);
    return album;
  }

  @Test
  void skipsTheQueryEntirelyPastTheChartResultCap() {
    int size = 20;
    int page = WeightedRating.MAX_CHART_RESULTS / size;

    PagedResponse<AlbumSummaryResponse> response =
        chartService.getTopAlbumsForYear(2020, page, size);

    assertThat(response.content()).isEmpty();
    assertThat(response.totalElements()).isEqualTo(WeightedRating.MAX_CHART_RESULTS);
    verifyNoInteractions(albumRepository);
  }

  @Test
  void mapsEveryAlbumInAnUnderCapPage() {
    Album album1 = album(1L);
    Album album2 = album(2L);
    Page<Album> page = new PageImpl<>(List.of(album1, album2));

    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            any(), any(), anyDouble(), anyDouble(), any()))
        .thenReturn(page);
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);
    when(chartMapper.toSummary(any(Album.class), eq(false)))
        .thenAnswer(
            invocation -> {
              Album a = invocation.getArgument(0);
              return new AlbumSummaryResponse(
                  a.getId(), "t", null, null, 0, 0, List.of(), List.of(), false);
            });

    PagedResponse<AlbumSummaryResponse> response = chartService.getTopAlbumsForYear(2020, 0, 20);

    assertThat(response.content()).extracting("id").containsExactly(1L, 2L);
    assertThat(response.totalElements()).isEqualTo(2);
    verifyNoInteractions(favoriteAlbumRepository);
  }

  @Test
  void onlyLooksUpFavoritesForAnAuthenticatedCaller() {
    Album album1 = album(1L);
    Page<Album> page = new PageImpl<>(List.of(album1));

    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            any(), any(), anyDouble(), anyDouble(), any()))
        .thenReturn(page);
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(42L);
    when(favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(eq(42L), any()))
        .thenReturn(Set.of(1L));
    when(chartMapper.toSummary(any(Album.class), anyBoolean()))
        .thenReturn(
            new AlbumSummaryResponse(1L, "t", null, null, 0, 0, List.of(), List.of(), true));

    chartService.getTopAlbumsForYear(2020, 0, 20);

    verify(chartMapper).toSummary(album1, true);
  }

  @Test
  void truncatesAPageThatStraddlesTheChartResultCap() {
    int size = 20;
    int page = WeightedRating.MAX_CHART_RESULTS / size - 1;
    int startIndex = page * size;
    int overflowBy = 5;

    List<Album> returned =
        IntStream.range(0, size + overflowBy).mapToObj(i -> album(startIndex + i)).toList();

    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            any(), any(), anyDouble(), anyDouble(), any()))
        .thenReturn(new PageImpl<>(returned));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);
    when(chartMapper.toSummary(any(Album.class), eq(false)))
        .thenAnswer(
            invocation -> {
              Album a = invocation.getArgument(0);
              return new AlbumSummaryResponse(
                  a.getId(), "t", null, null, 0, 0, List.of(), List.of(), false);
            });

    PagedResponse<AlbumSummaryResponse> response =
        chartService.getTopAlbumsForYear(2020, page, size);

    assertThat(response.content()).hasSize(size);
  }

  @Test
  void unrecognizedSortKeywordFallsBackToWeightedRating() {
    ArgumentCaptor<Double> signCaptor = ArgumentCaptor.forClass(Double.class);

    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findByGenreIgnoreCaseOrderByWeightedRating(
            eq("rock"), anyDouble(), anyDouble(), signCaptor.capture(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    chartService.getAlbumsByGenre("rock", "not-a-real-sort", true, null, 0, 20);

    assertThat(signCaptor.getValue()).isEqualTo(1.0);
  }

  @Test
  void alphabeticalSortUsesAPlainPropertySortInsteadOfWeightedRating() {
    when(albumRepository.findByGenreIgnoreCase(eq("rock"), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    chartService.getAlbumsByGenre("rock", "alphabetically", false, null, 0, 20);

    verify(albumRepository, never()).findGlobalAverageRating();
  }
}
