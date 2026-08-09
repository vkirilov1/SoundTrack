package org.soundtrack.api.album.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.chart.WeightedRating;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.FavoriteSongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlbumService {

  private final AlbumRepository albumRepository;
  private final AlbumMapper albumMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final FavoriteSongRepository favoriteSongRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public AlbumResponse getAlbumById(Long id) {

    Album album =
        albumRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Album not found"));

    Long userId = getAuthenticatedUserIdOrNull();

    boolean favorited =
        userId != null && favoriteAlbumRepository.existsByUserIdAndAlbumId(userId, id);

    Set<Long> favoritedSongIds =
        userId != null
            ? favoriteSongRepository.findFavoritedSongIdsByUserIdAndAlbumId(userId, id)
            : Set.of();

    Integer yearRank = getYearRankOrNull(album);

    return albumMapper.toResponse(album, favorited, favoritedSongIds, yearRank);
  }

  /**
   * This album's 1-based rank on its release year's chart, or null if it's unreviewed or falls
   * outside the chart's top {@link WeightedRating#MAX_CHART_RESULTS}. Reuses {@link
   * AlbumRepository#findByReleaseDateBetweenOrderByWeightedRating} - the exact same query and
   * result order the Year's chart page itself renders - and finds this album's position in it,
   * rather than re-deriving the rank from a second, independently-written formula that has to be
   * kept in sync by hand (that duplication is what caused the tie-break mismatch this replaces).
   */
  private Integer getYearRankOrNull(Album album) {
    if (album.getReviewsCount() <= 0) {
      return null;
    }

    int year = album.getReleaseDate().getYear();
    LocalDate start = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);

    double globalMean = albumRepository.findGlobalAverageRating();

    List<Album> chart =
        albumRepository
            .findByReleaseDateBetweenOrderByWeightedRating(
                start,
                end,
                WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING,
                globalMean,
                PageRequest.of(0, WeightedRating.MAX_CHART_RESULTS))
            .getContent();

    int index = 0;
    for (Album candidate : chart) {
      if (candidate.getId().equals(album.getId())) {
        return index + 1;
      }
      index++;
    }

    return null;
  }

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. GET /api/albums/{id}
   * is open to anonymous visitors but returns per-user favorited flags when a real session is
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
