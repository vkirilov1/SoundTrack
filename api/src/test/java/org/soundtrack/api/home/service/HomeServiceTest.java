package org.soundtrack.api.home.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.home.dto.HomeFeedResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class HomeServiceTest {

  @Mock private ReviewRepository reviewRepository;
  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private UserListRepository userListRepository;
  @Mock private UserFollowRepository userFollowRepository;
  @Mock private ChatRoomRepository chatRoomRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private ChartMapper chartMapper;
  @Mock private ChatService chatService;
  @Mock private CurrentUserService currentUserService;

  private HomeService homeService;
  private final User user = User.builder().id(1L).build();

  @BeforeEach
  void setUp() {
    homeService =
        new HomeService(
            reviewRepository,
            favoriteAlbumRepository,
            userListRepository,
            userFollowRepository,
            chatRoomRepository,
            albumRepository,
            chartMapper,
            chatService,
            currentUserService);

    lenient().when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    lenient().when(reviewRepository.findAlbumIdsByUserId(1L)).thenReturn(List.of());
    lenient().when(favoriteAlbumRepository.findAlbumIdsByUserId(1L)).thenReturn(List.of());
    lenient().when(userListRepository.findAlbumIdsByOwnerId(1L)).thenReturn(List.of());
    lenient().when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    lenient().when(reviewRepository.countByUserId(1L)).thenReturn(0L);
    lenient().when(reviewRepository.findAverageRatingByUserId(1L)).thenReturn(0.0);
    lenient().when(userFollowRepository.countByFollowingId(1L)).thenReturn(0L);
    lenient().when(reviewRepository.findTrendingAlbumIds(any(), any())).thenReturn(List.of());
    lenient()
        .when(reviewRepository.findMostRecentFromFollowing(any(), any()))
        .thenReturn(Page.empty());
    lenient()
        .when(favoriteAlbumRepository.findTopFavoriteGenres(any(), any()))
        .thenReturn(List.of());
  }

  private ChatRoom room(long id, long topicId, User... members) {
    return ChatRoom.builder()
        .id(id)
        .topicType(TopicType.ALBUM)
        .topicId(topicId)
        .members(new HashSet<>(List.of(members)))
        .build();
  }

  private ChatRoomResponse roomResponse(long id) {
    return new ChatRoomResponse(
        id,
        "r",
        TopicType.ALBUM,
        1L,
        null,
        null,
        null,
        null,
        false,
        20,
        1,
        List.of(),
        null,
        List.of());
  }

  @Test
  void activeRoomSuppressesSuggestions() {
    ChatRoom activeRoom = room(5L, 1L, user);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.of(activeRoom));
    when(chatService.toResponses(List.of(activeRoom))).thenReturn(List.of(roomResponse(5L)));

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.activeRoom().id()).isEqualTo(5L);
    assertThat(response.suggestedRooms()).isEmpty();
    verify(chatRoomRepository, never()).findByTopicTypeAndTopicIdIn(any(), any());
  }

  @Test
  void noSuggestionsWhenCallerHasNoActivityAtAll() {
    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.suggestedRooms()).isEmpty();
    verify(chatRoomRepository, never()).findByTopicTypeAndTopicIdIn(any(), any());
  }

  @Test
  void suggestedRoomsExcludeOnesCallerAlreadyBelongsToAndRespectPriorityOrder() {
    when(reviewRepository.findAlbumIdsByUserId(1L)).thenReturn(List.of(10L));
    when(favoriteAlbumRepository.findAlbumIdsByUserId(1L)).thenReturn(List.of(20L));

    User other = User.builder().id(2L).build();
    ChatRoom alreadyMember = room(1L, 10L, user);
    ChatRoom reviewedTopic = room(2L, 10L, other);
    ChatRoom favoritedTopic = room(3L, 20L, other);

    when(chatRoomRepository.findByTopicTypeAndTopicIdIn(
            eq(TopicType.ALBUM), eq(new LinkedHashSet<>(List.of(10L, 20L)))))
        .thenReturn(List.of(favoritedTopic, alreadyMember, reviewedTopic));
    when(chatService.toResponses(List.of(reviewedTopic, favoritedTopic)))
        .thenReturn(List.of(roomResponse(2L), roomResponse(3L)));

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.suggestedRooms()).extracting("id").containsExactly(2L, 3L);
  }

  @Test
  void trendingAlbumsPreserveRankOrderAndDropAlbumsMissingFromLookup() {
    when(reviewRepository.findTrendingAlbumIds(any(), any())).thenReturn(List.of(3L, 1L, 2L));
    Album album1 = new Album();
    album1.setId(1L);
    Album album3 = new Album();
    album3.setId(3L);
    when(albumRepository.findAllById(List.of(3L, 1L, 2L))).thenReturn(List.of(album1, album3));
    when(chartMapper.toSummary(any(Album.class), eq(false)))
        .thenAnswer(
            invocation -> {
              Album a = invocation.getArgument(0);
              return new AlbumSummaryResponse(
                  a.getId(), "t", null, null, 0, 0, List.of(), List.of(), false);
            });

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.trendingAlbums()).extracting("id").containsExactly(3L, 1L);
  }

  @Test
  void noRecentFollowingReviewWhenNoneExists() {
    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.recentFollowingReview()).isNull();
  }

  @Test
  void mapsMostRecentFollowingReview() {
    User reviewer = User.builder().id(2L).username("friend").build();
    Album album = new Album();
    album.setId(9L);
    album.setTitle("t");
    Review review = Review.builder().id(1L).user(reviewer).album(album).rating(4.5).build();
    when(reviewRepository.findMostRecentFromFollowing(any(), any()))
        .thenReturn(new PageImpl<>(List.of(review)));

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.recentFollowingReview().reviewerUsername()).isEqualTo("friend");
    assertThat(response.recentFollowingReview().albumId()).isEqualTo(9L);
  }

  @Test
  void genrePickIsNullWithoutAnyFavoriteGenres() {
    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.genrePick()).isNull();
  }

  @Test
  void genrePickUsesSentinelIdWhenCallerHasNoExclusions() {
    when(favoriteAlbumRepository.findTopFavoriteGenres(any(), any())).thenReturn(List.of("rock"));
    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    when(albumRepository.findTopRatedByGenreExcludingIds(
            eq("rock"), eq(Set.of(-1L)), anyDouble(), anyDouble(), any()))
        .thenReturn(Page.empty());

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.genrePick()).isNull();
  }

  @Test
  void genrePickReturnsTopRatedAlbumsInFavoriteGenre() {
    when(favoriteAlbumRepository.findTopFavoriteGenres(any(), any())).thenReturn(List.of("rock"));
    when(albumRepository.findGlobalAverageRating()).thenReturn(3.0);
    Album pick = new Album();
    pick.setId(7L);
    when(albumRepository.findTopRatedByGenreExcludingIds(
            eq("rock"), any(), anyDouble(), anyDouble(), any()))
        .thenReturn(new PageImpl<>(List.of(pick)));
    when(chartMapper.toSummary(pick, false))
        .thenReturn(
            new AlbumSummaryResponse(7L, "t", null, null, 0, 0, List.of(), List.of(), false));

    HomeFeedResponse response = homeService.getFeed();

    assertThat(response.genrePick().genre()).isEqualTo("rock");
    assertThat(response.genrePick().albums()).extracting("id").containsExactly(7L);
  }
}
