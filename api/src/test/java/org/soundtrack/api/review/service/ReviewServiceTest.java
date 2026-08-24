package org.soundtrack.api.review.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.review.dto.CreateReviewRequest;
import org.soundtrack.api.review.mapper.ReviewMapper;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

  @Mock private ReviewRepository reviewRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private UserRepository userRepository;
  @Mock private UserFollowRepository userFollowRepository;
  @Mock private ReviewMapper reviewMapper;
  @Mock private CurrentUserService currentUserService;

  private ReviewService reviewService;
  private final User user = User.builder().id(1L).username("me").build();

  @BeforeEach
  void setUp() {
    reviewService =
        new ReviewService(
            reviewRepository,
            albumRepository,
            userRepository,
            userFollowRepository,
            reviewMapper,
            currentUserService);
  }

  private Album album(long id, double rating, int reviewsCount) {
    Album album = new Album();
    album.setId(id);
    album.setTitle("t");
    album.setRating(rating);
    album.setReviewsCount(reviewsCount);
    return album;
  }

  private CreateReviewRequest request(double rating) {
    CreateReviewRequest request = new CreateReviewRequest();
    request.setRating(rating);
    request.setTitle("Great");
    request.setComment("comment");
    return request;
  }

  @Test
  void createReviewRejectsADuplicateReview() {
    Album album = album(1L, 0, 0);
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.existsByUserAndAlbum(user, album)).thenReturn(true);

    assertThatThrownBy(() -> reviewService.createReview(1L, request(4.0)))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void createReviewRejectsRatingsNotInHalfStepIncrements() {
    Album album = album(1L, 0, 0);
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.existsByUserAndAlbum(user, album)).thenReturn(false);

    assertThatThrownBy(() -> reviewService.createReview(1L, request(3.3)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void createReviewRejectsRatingsOutsideZeroToFive() {
    Album album = album(1L, 0, 0);
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.existsByUserAndAlbum(user, album)).thenReturn(false);

    assertThatThrownBy(() -> reviewService.createReview(1L, request(5.5)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void createReviewRecomputesTheAlbumsAverageRating() {
    Album album = album(1L, 4.0, 1);
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.existsByUserAndAlbum(user, album)).thenReturn(false);
    when(reviewRepository.save(any(Review.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    reviewService.createReview(1L, request(5.0));

    assertThat(album.getRating()).isCloseTo(4.5, within(0.0001));
    assertThat(album.getReviewsCount()).isEqualTo(2);
  }

  @Test
  void updateReviewRejectsAReviewFromADifferentAlbum() {
    Album album = album(1L, 0, 1);
    Review review = Review.builder().id(1L).album(album(2L, 0, 1)).user(user).rating(3.0).build();
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

    assertThatThrownBy(() -> reviewService.updateReview(1L, 1L, request(4.0)))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void updateReviewRejectsAnEditorWhoIsNotTheAuthor() {
    Album album = album(1L, 0, 1);
    User someoneElse = User.builder().id(2L).build();
    Review review = Review.builder().id(1L).album(album).user(someoneElse).rating(3.0).build();
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

    assertThatThrownBy(() -> reviewService.updateReview(1L, 1L, request(4.0)))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void updateReviewRecomputesTheAlbumsAverageRating() {
    Album album = album(1L, 4.0, 2);
    Review review = Review.builder().id(1L).album(album).user(user).rating(3.0).build();
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
    when(reviewRepository.save(review)).thenReturn(review);

    reviewService.updateReview(1L, 1L, request(5.0));

    assertThat(album.getRating()).isCloseTo(5.0, within(0.0001));
    assertThat(review.getRating()).isEqualTo(5.0);
  }

  @Test
  void deleteReviewResetsAlbumRatingWhenItWasTheOnlyReview() {
    Album album = album(1L, 4.0, 1);
    Review review = Review.builder().id(1L).album(album).user(user).rating(4.0).build();
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

    reviewService.deleteReview(1L, 1L);

    assertThat(album.getRating()).isEqualTo(0);
    assertThat(album.getReviewsCount()).isEqualTo(0);
    verify(reviewRepository).delete(review);
  }

  @Test
  void deleteReviewRecomputesTheAverageWhenOtherReviewsRemain() {
    Album album = album(1L, 4.0, 2);
    Review review = Review.builder().id(1L).album(album).user(user).rating(2.0).build();
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

    reviewService.deleteReview(1L, 1L);

    assertThat(album.getRating()).isCloseTo(6.0, within(0.0001));
    assertThat(album.getReviewsCount()).isEqualTo(1);
  }

  @Test
  void deleteAllReviewsByUserRecomputesEveryAffectedAlbum() {
    Album soleReviewAlbum = album(1L, 5.0, 1);
    Album sharedAlbum = album(2L, 4.0, 2);
    Review reviewOne =
        Review.builder().id(1L).album(soleReviewAlbum).user(user).rating(5.0).build();
    Review reviewTwo = Review.builder().id(2L).album(sharedAlbum).user(user).rating(2.0).build();

    when(reviewRepository.findByUserId(1L)).thenReturn(List.of(reviewOne, reviewTwo));
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(soleReviewAlbum));
    when(albumRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(sharedAlbum));

    reviewService.deleteAllReviewsByUser(1L);

    assertThat(soleReviewAlbum.getRating()).isEqualTo(0);
    assertThat(soleReviewAlbum.getReviewsCount()).isEqualTo(0);
    assertThat(sharedAlbum.getRating()).isCloseTo(6.0, within(0.0001));
    assertThat(sharedAlbum.getReviewsCount()).isEqualTo(1);
    verify(reviewRepository).deleteAll(List.of(reviewOne, reviewTwo));
  }

  @Test
  void getAlbumReviewsRequiresAnExistingAlbum() {
    when(albumRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> reviewService.getAlbumReviews(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void anonymousViewerGetsCreatedAtOrderWithoutFollowedFlags() {
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album(1L, 0, 0)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);
    when(reviewRepository.findByAlbumId(any(), any())).thenReturn(Page.empty());

    reviewService.getAlbumReviews(1L, 0, 20);

    verify(reviewRepository, never()).findByAlbumIdOrderByFollowedFirst(any(), any(), any());
    verify(userFollowRepository, never())
        .findFollowingIdsByFollowerIdAndFollowingIdIn(any(), any());
  }

  @Test
  void authenticatedViewerPinsFollowedAuthorsFirst() {
    User author = User.builder().id(5L).username("author").build();
    Review review = Review.builder().id(1L).album(album(1L, 0, 1)).user(author).rating(4.0).build();
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album(1L, 0, 1)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(9L);
    when(reviewRepository.findByAlbumIdOrderByFollowedFirst(any(), any(), any()))
        .thenReturn(new PageImpl<>(List.of(review)));
    when(userFollowRepository.findFollowingIdsByFollowerIdAndFollowingIdIn(any(), any()))
        .thenReturn(java.util.Set.of(5L));

    ArgumentCaptor<Boolean> followedCaptor = ArgumentCaptor.forClass(Boolean.class);
    reviewService.getAlbumReviews(1L, 0, 20);

    verify(reviewMapper)
        .toResponse(org.mockito.ArgumentMatchers.eq(review), followedCaptor.capture());
    assertThat(followedCaptor.getValue()).isTrue();
  }

  @Test
  void getMyReviewRequiresTheCallerToHaveReviewed() {
    Album album = album(1L, 0, 0);
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    when(reviewRepository.findByUserAndAlbum(user, album)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> reviewService.getMyReview(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getUserReviewsRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> reviewService.getUserReviews(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
