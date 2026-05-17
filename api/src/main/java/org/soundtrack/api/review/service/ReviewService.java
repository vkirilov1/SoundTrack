package org.soundtrack.api.review.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.review.dto.CreateReviewRequest;
import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.mapper.ReviewMapper;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepository;

  private final AlbumRepository albumRepository;

  private final UserRepository userRepository;

  private final ReviewMapper reviewMapper;

  @Transactional
  public ReviewResponse createReview(Long albumId, CreateReviewRequest request) {

    Album album = findAlbumById(albumId);

    User user = getAuthenticatedUser();

    if (reviewRepository.existsByUserAndAlbum(user, album)) {
      throw new ResourceExistsException(
          String.format(
              "Album %s has already been reviewed by user %s", album.getTitle(), user.getEmail()));
    }

    Review review =
        Review.builder()
            .rating(request.getRating())
            .title(request.getTitle())
            .comment(request.getComment())
            .album(album)
            .user(user)
            .edited(false)
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

    Album album = findAlbumById(albumId);

    User user = getAuthenticatedUser();

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
    review.setEdited(true);

    Review savedReview = reviewRepository.save(review);

    return reviewMapper.toResponse(savedReview);
  }

  @Transactional
  public void deleteReview(Long albumId, Long reviewId) {

    Album album = findAlbumById(albumId);

    User user = getAuthenticatedUser();

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

  @Transactional(readOnly = true)
  public PagedResponse<ReviewResponse> getAlbumReviews(Long albumId, int page, int size) {

    findAlbumById(albumId);

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    Page<Review> reviewPage = reviewRepository.findByAlbumId(albumId, pageable);

    List<ReviewResponse> content =
        reviewPage.getContent().stream().map(reviewMapper::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, reviewPage.getTotalElements(), reviewPage.getTotalPages());
  }

  /**
   * Returns authenticated user from JWT context
   *
   * @return the user
   */
  private User getAuthenticatedUser() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    return findUserByEmail(email);
  }

  /**
   * Validates album ownership and review ownership
   *
   * @param review the review object
   * @param albumId the album id
   * @param user the user object
   * @param action the action the user is making
   */
  private void validateReviewOwnership(Review review, Long albumId, User user, String action) {

    if (!review.getAlbum().getId().equals(albumId)) {
      throw new IllegalArgumentException("Review does not belong to this album");
    }

    if (!review.getUser().getId().equals(user.getId())) {
      throw new AccessDeniedException("You cannot " + action + " this review");
    }
  }

  /**
   * Pulls album from database
   *
   * @param albumId the album id
   * @return the album object
   */
  private Album findAlbumById(Long albumId) {
    return albumRepository
        .findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
  }

  /**
   * Pulls user from database
   *
   * @param email the user email
   * @return the user object
   */
  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  /**
   * Calculates album rating after creating review
   *
   * @param album the album object
   * @param newCount the new count of reviews
   * @param newRating the new rating to add
   * @return the calculated rating
   */
  private double calculateCreatedReviewRating(Album album, int newCount, double newRating) {

    double oldTotalScore = album.getRating() * album.getReviewsCount();

    return (oldTotalScore + newRating) / newCount;
  }

  /**
   * Calculates album rating after updating review
   *
   * @param album the album object
   * @param oldReviewRating the old rating
   * @param newReviewRating the new rating
   * @return the calculated rating
   */
  private double calculateUpdatedReviewRating(
      Album album, double oldReviewRating, double newReviewRating) {

    double currentTotalScore = album.getRating() * album.getReviewsCount();

    double updatedTotalScore = currentTotalScore - oldReviewRating + newReviewRating;

    return updatedTotalScore / album.getReviewsCount();
  }

  /**
   * Calculates album rating after deleting review
   *
   * @param album the album object
   * @param currentCount the current count of reviews
   * @param deletedReviewRating the rating that gets deleted
   * @return the calculated rating
   */
  private double calculateDeletedReviewRating(
      Album album, int currentCount, double deletedReviewRating) {

    double currentTotalScore = album.getRating() * currentCount;

    return (currentTotalScore - deletedReviewRating) / (currentCount - 1);
  }
}
