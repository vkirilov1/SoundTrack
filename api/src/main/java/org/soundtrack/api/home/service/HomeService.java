package org.soundtrack.api.home.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.WeightedRating;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.home.dto.FollowingReviewResponse;
import org.soundtrack.api.home.dto.GenrePickResponse;
import org.soundtrack.api.home.dto.HomeFeedResponse;
import org.soundtrack.api.home.dto.HomeStatsResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.TopicType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserListRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeService {

  /** How many chat rooms the "might wanna join" card ever shows. */
  private static final int MAX_SUGGESTED_ROOMS = 5;

  /** Never a real album id - keeps the "excluding ids" genre query's IN clause non-empty. */
  private static final long NO_ALBUM_SENTINEL_ID = -1L;

  /** How far back "trending this week" looks. */
  private static final int TRENDING_WINDOW_DAYS = 7;

  private static final int MAX_TRENDING_ALBUMS = 5;

  private static final int MAX_GENRE_PICKS = 5;

  private final ReviewRepository reviewRepository;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final UserListRepository userListRepository;
  private final UserFollowRepository userFollowRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final AlbumRepository albumRepository;
  private final UserRepository userRepository;
  private final ChartMapper chartMapper;
  private final ChatService chatService;

  @Transactional(readOnly = true)
  public HomeFeedResponse getFeed() {
    User user = getAuthenticatedUser();

    List<Long> reviewedAlbumIds = reviewRepository.findAlbumIdsByUserId(user.getId());
    List<Long> favoritedAlbumIds = favoriteAlbumRepository.findAlbumIdsByUserId(user.getId());
    List<Long> listAlbumIds = userListRepository.findAlbumIdsByOwnerId(user.getId());

    ChatRoomResponse activeRoom = findActiveRoom(user.getId());
    // Already in a room? Suggesting new ones is moot - joining would mean leaving this one first.
    List<ChatRoomResponse> suggestedRooms =
        activeRoom != null
            ? List.of()
            : findSuggestedRooms(user.getId(), reviewedAlbumIds, favoritedAlbumIds, listAlbumIds);

    return new HomeFeedResponse(
        findStats(user.getId()),
        activeRoom,
        findRecentFollowingReview(user.getId()),
        suggestedRooms,
        findTrendingAlbums(),
        findGenrePick(user.getId(), reviewedAlbumIds, favoritedAlbumIds, listAlbumIds));
  }

  private HomeStatsResponse findStats(Long userId) {
    return new HomeStatsResponse(
        reviewRepository.countByUserId(userId),
        reviewRepository.findAverageRatingByUserId(userId),
        userFollowRepository.countByFollowingId(userId));
  }

  /** The room the caller is currently in, if any - "jump back in" instead of new suggestions. */
  private ChatRoomResponse findActiveRoom(Long userId) {
    return chatRoomRepository
        .findByMemberId(userId)
        .map(room -> chatService.toResponses(List.of(room)).get(0))
        .orElse(null);
  }

  /**
   * The site's most-reviewed albums in the last {@value #TRENDING_WINDOW_DAYS} days - not
   * personalized, so a brand-new account still sees something alive on their first visit.
   */
  private List<AlbumSummaryResponse> findTrendingAlbums() {
    LocalDateTime since = LocalDateTime.now().minusDays(TRENDING_WINDOW_DAYS);
    List<Long> trendingIds =
        reviewRepository.findTrendingAlbumIds(since, PageRequest.of(0, MAX_TRENDING_ALBUMS));

    if (trendingIds.isEmpty()) {
      return List.of();
    }

    Map<Long, Album> albumsById =
        albumRepository.findAllById(trendingIds).stream()
            .collect(Collectors.toMap(Album::getId, a -> a));

    return trendingIds.stream()
        .map(albumsById::get)
        .filter(Objects::nonNull)
        .map(album -> chartMapper.toSummary(album, false))
        .toList();
  }

  private FollowingReviewResponse findRecentFollowingReview(Long userId) {
    Page<Review> page = reviewRepository.findMostRecentFromFollowing(userId, PageRequest.of(0, 1));
    if (page.isEmpty()) {
      return null;
    }

    Review review = page.getContent().get(0);
    Album album = review.getAlbum();
    User reviewer = review.getUser();

    return new FollowingReviewResponse(
        review.getId(),
        reviewer.getId(),
        reviewer.getUsername(),
        reviewer.getProfilePicture(),
        album.getId(),
        album.getTitle(),
        album.getCoverUrl(),
        review.getRating(),
        review.getTitle(),
        review.getComment(),
        review.getCreatedAt());
  }

  /**
   * Rooms about an album the caller has reviewed (highest priority), favorited, or added to a list,
   * in that order - rooms the caller already belongs to are never suggested.
   */
  private List<ChatRoomResponse> findSuggestedRooms(
      Long userId,
      List<Long> reviewedAlbumIds,
      List<Long> favoritedAlbumIds,
      List<Long> listAlbumIds) {

    LinkedHashSet<Long> priorityAlbumIds = new LinkedHashSet<>();
    priorityAlbumIds.addAll(reviewedAlbumIds);
    priorityAlbumIds.addAll(favoritedAlbumIds);
    priorityAlbumIds.addAll(listAlbumIds);

    if (priorityAlbumIds.isEmpty()) {
      return List.of();
    }

    Map<Long, Integer> priorityByAlbumId = new HashMap<>();
    int rank = 0;
    for (Long albumId : priorityAlbumIds) {
      priorityByAlbumId.put(albumId, rank++);
    }

    List<ChatRoom> candidates =
        chatRoomRepository.findByTopicTypeAndTopicIdIn(TopicType.ALBUM, priorityAlbumIds);

    List<ChatRoom> eligible =
        candidates.stream()
            .filter(room -> room.getMembers().stream().noneMatch(m -> m.getId().equals(userId)))
            .sorted(Comparator.comparing(room -> priorityByAlbumId.get(room.getTopicId())))
            .limit(MAX_SUGGESTED_ROOMS)
            .toList();

    return chatService.toResponses(eligible);
  }

  /**
   * The caller's most-favorited genre, then up to {@value #MAX_GENRE_PICKS} top-rated albums in it
   * they haven't already reviewed, favorited, or listed. Null when they have no favorites yet, or
   * nothing new is left to surface in that genre.
   */
  private GenrePickResponse findGenrePick(
      Long userId,
      List<Long> reviewedAlbumIds,
      List<Long> favoritedAlbumIds,
      List<Long> listAlbumIds) {

    List<String> topGenres =
        favoriteAlbumRepository.findTopFavoriteGenres(userId, PageRequest.of(0, 1));
    if (topGenres.isEmpty()) {
      return null;
    }
    String genre = topGenres.getFirst();

    Set<Long> excludedIds = new HashSet<>();
    excludedIds.addAll(reviewedAlbumIds);
    excludedIds.addAll(favoritedAlbumIds);
    excludedIds.addAll(listAlbumIds);
    if (excludedIds.isEmpty()) {
      excludedIds.add(NO_ALBUM_SENTINEL_ID);
    }

    double globalMean = albumRepository.findGlobalAverageRating();
    Page<Album> picks =
        albumRepository.findTopRatedByGenreExcludingIds(
            genre,
            excludedIds,
            WeightedRating.MIN_REVIEWS_FOR_TRUSTED_RATING,
            globalMean,
            PageRequest.of(0, MAX_GENRE_PICKS));

    if (picks.isEmpty()) {
      return null;
    }

    List<AlbumSummaryResponse> summaries =
        picks.getContent().stream().map(album -> chartMapper.toSummary(album, false)).toList();
    return new GenrePickResponse(genre, summaries);
  }

  private User getAuthenticatedUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(auth.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
