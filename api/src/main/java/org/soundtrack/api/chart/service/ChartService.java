package org.soundtrack.api.chart.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.WeightedRating;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChartService {

  private final AlbumRepository albumRepository;
  private final ChartMapper chartMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getTopAlbumsForYear(int year, int page, int size) {

    LocalDate start = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);

    double globalMean = albumRepository.findGlobalAverageRating();
    Pageable pageable = PageRequest.of(page, size);

    Page<Album> albumPage =
        albumRepository.findByReleaseDateBetweenOrderByWeightedRating(
            start, end, WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING, globalMean, pageable);

    return toPagedResponse(albumPage, page, size);
  }

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSummaryResponse> getAlbumsByGenre(
      String genre, String sort, boolean descending, int page, int size) {

    String property = toSortProperty(sort);
    Page<Album> albumPage;

    if ("rating".equals(property)) {
      double globalMean = albumRepository.findGlobalAverageRating();
      double sign = descending ? 1.0 : -1.0;
      Pageable pageable = PageRequest.of(page, size);
      albumPage =
          albumRepository.findByGenreIgnoreCaseOrderByWeightedRating(
              genre, WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING, globalMean, sign, pageable);
    } else {
      Sort.Direction direction = descending ? Sort.Direction.DESC : Sort.Direction.ASC;
      Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
      albumPage = albumRepository.findByGenreIgnoreCase(genre, pageable);
    }

    return toPagedResponse(albumPage, page, size);
  }

  /**
   * Maps a client-facing sort keyword to its {@link Album} property, falling back to "rating" for
   * anything unrecognized rather than erroring — this is a browse filter, not a validated input.
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
   * Charts only ever show the top {@link WeightedRating#MAX_CHART_RESULTS} results - both the
   * reported totals and the returned page are clamped to that boundary, so pagination never offers
   * (and can never be made to return) anything past rank 1000.
   */
  private PagedResponse<AlbumSummaryResponse> toPagedResponse(
      Page<Album> albumPage, int page, int size) {

    long totalElements = Math.min(albumPage.getTotalElements(), WeightedRating.MAX_CHART_RESULTS);
    int totalPages = (int) Math.ceil((double) totalElements / size);

    int startIndex = page * size;
    List<Album> albums = albumPage.getContent();
    if (startIndex >= WeightedRating.MAX_CHART_RESULTS) {
      albums = List.of();
    } else if (startIndex + albums.size() > WeightedRating.MAX_CHART_RESULTS) {
      albums = albums.subList(0, WeightedRating.MAX_CHART_RESULTS - startIndex);
    }

    Set<Long> albumIds = albums.stream().map(Album::getId).collect(Collectors.toSet());

    Long userId = getAuthenticatedUserIdOrNull();

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

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. Both chart endpoints
   * are open to anonymous visitors but return per-user favorited flags when a real session is
   * present.
   *
   * @return the current user's id, or null if not authenticated
   */
  private Long getAuthenticatedUserIdOrNull() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getName())) {
      return null;
    }

    return userRepository.findByEmail(authentication.getName()).map(User::getId).orElse(null);
  }
}
