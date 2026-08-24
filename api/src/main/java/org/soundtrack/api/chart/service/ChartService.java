package org.soundtrack.api.chart.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.WeightedRating;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChartService {

  /**
   * How far back the Drops "Recently Added" feed looks - keeps it honestly "recent" rather than a
   * growing archive.
   */
  private static final int RECENTLY_ADDED_WINDOW_DAYS = 30;

  private final AlbumRepository albumRepository;
  private final ChartMapper chartMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getTopAlbumsForYear(int year, int page, int size) {

    LocalDate start = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);

    return getChartPage(
        page,
        size,
        () -> {
          double globalMean = albumRepository.findGlobalAverageRating();
          Pageable pageable = PageRequest.of(page, size);
          return albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
              start, end, WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING, globalMean, pageable);
        });
  }

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getAlbumsByGenre(
      String genre, String sort, boolean descending, Long artistId, int page, int size) {

    String property = toSortProperty(sort);

    return getChartPage(
        page,
        size,
        () -> {
          if ("rating".equals(property)) {
            double globalMean = albumRepository.findGlobalAverageRating();
            double sign = descending ? 1.0 : -1.0;
            Pageable pageable = PageRequest.of(page, size);
            return artistId != null
                ? albumRepository.findByGenreIgnoreCaseAndArtistIdOrderByWeightedRating(
                    genre,
                    artistId,
                    WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING,
                    globalMean,
                    sign,
                    pageable)
                : albumRepository.findByGenreIgnoreCaseOrderByWeightedRating(
                    genre,
                    WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING,
                    globalMean,
                    sign,
                    pageable);
          }
          Sort.Direction direction = descending ? Sort.Direction.DESC : Sort.Direction.ASC;
          Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
          return artistId != null
              ? albumRepository.findByGenreIgnoreCaseAndArtistId(genre, artistId, pageable)
              : albumRepository.findByGenreIgnoreCase(genre, pageable);
        });
  }

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getTopAlbumsOverall(int page, int size) {
    return getChartPage(
        page,
        size,
        () -> {
          double globalMean = albumRepository.findGlobalAverageRating();
          Pageable pageable = PageRequest.of(page, size);
          return albumRepository.findByOverallOrderByWeightedRating(
              WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING, globalMean, pageable);
        });
  }

  /**
   * Distinct release years with chart data, newest first - populates the Charts page's year picker.
   */
  @Transactional(readOnly = true)
  public List<Integer> getAvailableYears() {
    return albumRepository.findDistinctYearsWithReviews();
  }

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getRecentlyAdded(int page, int size) {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(RECENTLY_ADDED_WINDOW_DAYS);
    Pageable pageable = PageRequest.of(page, size);
    Page<Album> albumPage =
        albumRepository.findByCreatedAtAfterOrderByCreatedAtDesc(cutoff, pageable);
    return buildResponse(albumPage.getContent(), page, size, albumPage.getTotalElements());
  }

  /**
   * Maps a client-facing sort keyword to its {@link Album} property, falling back to "rating" for
   * anything unrecognized rather than erroring - this is a browse filter, not a validated input.
   */
  private String toSortProperty(String sort) {
    return switch (sort.toLowerCase(Locale.ROOT)) {
      case "alphabetically" -> "title";
      case "releasedate" -> "releaseDate";
      case "reviewscount" -> "reviewsCount";
      default -> "rating";
    };
  }

  /**
   * Charts only ever show the top {@link WeightedRating#MAX_CHART_RESULTS} results. When the
   * requested page is past that boundary, the query is skipped entirely.
   */
  private PagedResponse<AlbumSummaryResponse> getChartPage(
      int page, int size, Supplier<Page<Album>> query) {

    int startIndex = page * size;
    if (startIndex >= WeightedRating.MAX_CHART_RESULTS) {
      int cappedTotalPages = (int) Math.ceil((double) WeightedRating.MAX_CHART_RESULTS / size);
      return new PagedResponse<>(
          List.of(), page, size, WeightedRating.MAX_CHART_RESULTS, cappedTotalPages);
    }

    return toPagedResponse(query.get(), page, size);
  }

  private PagedResponse<AlbumSummaryResponse> toPagedResponse(
      Page<Album> albumPage, int page, int size) {

    long totalElements = Math.min(albumPage.getTotalElements(), WeightedRating.MAX_CHART_RESULTS);

    int startIndex = page * size;
    List<Album> albums = albumPage.getContent();
    if (startIndex + albums.size() > WeightedRating.MAX_CHART_RESULTS) {
      albums = albums.subList(0, WeightedRating.MAX_CHART_RESULTS - startIndex);
    }

    return buildResponse(albums, page, size, totalElements);
  }

  private PagedResponse<AlbumSummaryResponse> buildResponse(
      List<Album> albums, int page, int size, long totalElements) {

    int totalPages = (int) Math.ceil((double) totalElements / size);

    Set<Long> albumIds = albums.stream().map(Album::getId).collect(Collectors.toSet());

    Long userId = currentUserService.getAuthenticatedUserIdOrNull();

    Set<Long> favoritedAlbumIds =
        userId != null && !albumIds.isEmpty()
            ? favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(userId, albumIds)
            : Set.of();

    List<AlbumSummaryResponse> content =
        albums.stream()
            .map(album -> chartMapper.toSummary(album, favoritedAlbumIds.contains(album.getId())))
            .toList();

    return new PagedResponse<>(content, page, size, totalElements, totalPages);
  }
}
