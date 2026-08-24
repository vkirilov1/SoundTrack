package org.soundtrack.api.review.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.review.dto.CreateReviewRequest;
import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.dto.UserReviewResponse;
import org.soundtrack.api.review.mapper.ReviewMapper;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepository;

  private final AlbumRepository albumRepository;

  private final UserRepository userRepository;

  private final UserFollowRepository userFollowRepository;

  private final ReviewMapper reviewMapper;

  private final CurrentUserService currentUserService;

  @Transactional
  public ReviewResponse createReview(Long albumId, CreateReviewRequest request) {

    Album album = findAlbumForUpdate(albumId);

    User user = currentUserService.getAuthenticatedUser();

    if (reviewRepository.existsByUserAndAlbum(user, album)) {
      throw new ResourceExistsException(
          String.format(
              "Album %s has already been reviewed by user %s",
              album.getTitle(), user.getUsername()));
    }

    double rating = request.getRating();

    if (rating < 0.0 || rating > 5.0 || rating * 2 != (int) (rating * 2)) {
      throw new IllegalArgumentException(
          String.format(
              "Invalid rating %s. Only increments of .5 allowed, ranging from 0-5", rating));
    }

    Review review =
        Review.builder()
            .rating(rating)
            .title(request.getTitle())
            .comment(request.getComment())
            .album(album)
            .user(user)
            .createdAt(LocalDateTime.now())
            .build();

    Review savedReview = reviewRepository.save(review);

    int newCount = album.getReviewsCount() + 1;

    double updatedAlbumRating = calculateCreatedReviewRating(album, newCount, request.getRating());

    album.setRating(updatedAlbumRating);
    album.setReviewsCount(newCount);

    return reviewMapper.toResponse(savedReview);
  }

  @Transactional
  public ReviewResponse updateReview(Long albumId, Long reviewId, CreateReviewRequest request) {

    Album album = findAlbumForUpdate(albumId);

    User user = currentUserService.getAuthenticatedUser();

    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

    validateReviewOwnership(review, albumId, user, "edit");

    double updatedRating =
        calculateUpdatedReviewRating(album, review.getRating(), request.getRating());

    album.setRating(updatedRating);

    review.setRating(request.getRating());
    review.setTitle(request.getTitle());
    review.setComment(request.getComment());

    Review savedReview = reviewRepository.save(review);

    return reviewMapper.toResponse(savedReview);
  }

  @Transactional
  public void deleteReview(Long albumId, Long reviewId) {

    Album album = findAlbumForUpdate(albumId);

    User user = currentUserService.getAuthenticatedUser();

    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

    validateReviewOwnership(review, albumId, user, "delete");

    int currentCount = album.getReviewsCount();

    if (currentCount <= 1) {
      album.setRating(0);
      album.setReviewsCount(0);
    } else {

      double updatedRating = calculateDeletedReviewRating(album, currentCount, review.getRating());

      album.setRating(updatedRating);
      album.setReviewsCount(currentCount - 1);
    }

    reviewRepository.delete(review);
  }

  /** Deletes every review a user has written, recomputing each affected album's rating/count. */
  @Transactional
  public void deleteAllReviewsByUser(Long userId) {
    List<Review> reviews = reviewRepository.findByUserId(userId);

    for (Review review : reviews) {
      Album album = findAlbumForUpdate(review.getAlbum().getId());
      int currentCount = album.getReviewsCount();

      if (currentCount <= 1) {
        album.setRating(0);
        album.setReviewsCount(0);
      } else {
        double updatedRating =
            calculateDeletedReviewRating(album, currentCount, review.getRating());
        album.setRating(updatedRating);
        album.setReviewsCount(currentCount - 1);
      }
    }

    reviewRepository.deleteAll(reviews);
  }

  @Transactional(readOnly = true)
  public PagedResponse<ReviewResponse> getAlbumReviews(Long albumId, int page, int size) {

    findAlbumById(albumId);

    Long viewerId = currentUserService.getAuthenticatedUserIdOrNull();

    Page<Review> reviewPage;
    if (viewerId != null) {
      reviewPage =
          reviewRepository.findByAlbumIdOrderByFollowedFirst(
              albumId, viewerId, PageRequest.of(page, size));
    } else {
      reviewPage =
          reviewRepository.findByAlbumId(
              albumId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    Set<Long> followedAuthorIds =
        viewerId != null
            ? userFollowRepository.findFollowingIdsByFollowerIdAndFollowingIdIn(
                viewerId,
                reviewPage.getContent().stream()
                    .map(r -> r.getUser().getId())
                    .collect(Collectors.toSet()))
            : Set.of();

    List<ReviewResponse> content =
        reviewPage.getContent().stream()
            .map(r -> reviewMapper.toResponse(r, followedAuthorIds.contains(r.getUser().getId())))
            .toList();

    return new PagedResponse<>(
        content, page, size, reviewPage.getTotalElements(), reviewPage.getTotalPages());
  }

  @Transactional(readOnly = true)
  public ReviewResponse getMyReview(Long albumId) {

    Album album = findAlbumById(albumId);

    User user = currentUserService.getAuthenticatedUser();

    Review review =
        reviewRepository
            .findByUserAndAlbum(user, album)
            .orElseThrow(() -> new ResourceNotFoundException("You haven't reviewed this album"));

    return reviewMapper.toResponse(review);
  }

  @Transactional(readOnly = true)
  public PagedResponse<UserReviewResponse> getUserReviews(Long userId, int page, int size) {

    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    Page<Review> reviewPage = reviewRepository.findByUserId(userId, pageable);

    List<UserReviewResponse> content =
        reviewPage.getContent().stream().map(reviewMapper::toUserReviewResponse).toList();

    return new PagedResponse<>(
        content, page, size, reviewPage.getTotalElements(), reviewPage.getTotalPages());
  }

  private void validateReviewOwnership(Review review, Long albumId, User user, String action) {

    if (!review.getAlbum().getId().equals(albumId)) {
      throw new InvalidOperationException("Review does not belong to this album");
    }

    if (!review.getUser().getId().equals(user.getId())) {
      throw new ForbiddenException("You cannot " + action + " this review");
    }
  }

  private Album findAlbumById(Long albumId) {
    return albumRepository
        .findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
  }

  /**
   * Same as {@link #findAlbumById}, but takes a row lock on the album - required before any
   * read-recompute-write on {@code rating}/{@code reviewsCount} to avoid a lost update between two
   * concurrent reviews on the same album.
   */
  private Album findAlbumForUpdate(Long albumId) {
    return albumRepository
        .findByIdForUpdate(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
  }

  private double calculateCreatedReviewRating(Album album, int newCount, double newRating) {

    double oldTotalScore = album.getRating() * album.getReviewsCount();

    return (oldTotalScore + newRating) / newCount;
  }

  private double calculateUpdatedReviewRating(
      Album album, double oldReviewRating, double newReviewRating) {

    double currentTotalScore = album.getRating() * album.getReviewsCount();

    double updatedTotalScore = currentTotalScore - oldReviewRating + newReviewRating;

    return updatedTotalScore / album.getReviewsCount();
  }

  private double calculateDeletedReviewRating(
      Album album, int currentCount, double deletedReviewRating) {

    double currentTotalScore = album.getRating() * currentCount;

    return (currentTotalScore - deletedReviewRating) / (currentCount - 1);
  }
}
