package org.soundtrack.api.review.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.review.dto.CreateReviewReplyRequest;
import org.soundtrack.api.review.dto.ReviewReplyResponse;
import org.soundtrack.api.review.mapper.ReviewReplyMapper;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.ReviewReply;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.ReviewReplyRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewReplyService {

  private final ReviewReplyRepository reviewReplyRepository;
  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final ReviewReplyMapper reviewReplyMapper;

  @Transactional(readOnly = true)
  public PagedResponse<ReviewReplyResponse> getReviewReplies(
      Long albumId, Long reviewId, int page, int size) {

    Review review = findReviewById(reviewId);
    validateReviewBelongsToAlbum(review, albumId);

    Page<ReviewReply> replyPage =
        reviewReplyRepository.findByReviewId(
            reviewId, PageRequest.of(page, size, Sort.by("createdAt").ascending()));

    List<ReviewReplyResponse> content =
        replyPage.getContent().stream().map(reviewReplyMapper::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, replyPage.getTotalElements(), replyPage.getTotalPages());
  }

  @Transactional
  public ReviewReplyResponse createReply(
      Long albumId, Long reviewId, CreateReviewReplyRequest request) {

    User user = getAuthenticatedUser();
    Review review = findReviewById(reviewId);
    validateReviewBelongsToAlbum(review, albumId);

    ReviewReply reply =
        ReviewReply.builder()
            .message(request.getMessage())
            .edited(false)
            .review(review)
            .user(user)
            .createdAt(LocalDateTime.now())
            .build();

    return reviewReplyMapper.toResponse(reviewReplyRepository.save(reply));
  }

  @Transactional
  public ReviewReplyResponse updateReply(
      Long albumId, Long reviewId, Long replyId, CreateReviewReplyRequest request) {

    User user = getAuthenticatedUser();
    Review review = findReviewById(reviewId);
    validateReviewBelongsToAlbum(review, albumId);
    ReviewReply reply = findReplyById(replyId);
    validateReplyBelongsToReview(reply, reviewId);
    validateReplyOwnership(reply, user);

    reply.setMessage(request.getMessage());
    reply.setEdited(true);

    return reviewReplyMapper.toResponse(reviewReplyRepository.save(reply));
  }

  @Transactional
  public void deleteReply(Long albumId, Long reviewId, Long replyId) {

    User user = getAuthenticatedUser();
    Review review = findReviewById(reviewId);
    validateReviewBelongsToAlbum(review, albumId);
    ReviewReply reply = findReplyById(replyId);
    validateReplyBelongsToReview(reply, reviewId);
    validateReplyOwnership(reply, user);

    reviewReplyRepository.delete(reply);
  }

  /**
   * Returns authenticated user from JWT context
   *
   * @return the user
   */
  private User getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  /**
   * Fetches a Review from the database from id
   *
   * @param reviewId the id of the review
   * @return the review object
   */
  private Review findReviewById(Long reviewId) {
    return reviewRepository
        .findById(reviewId)
        .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
  }

  /**
   * Fetches a reply from the database based on reply id
   *
   * @param replyId the id of the reply
   * @return the reply object
   */
  private ReviewReply findReplyById(Long replyId) {
    return reviewReplyRepository
        .findById(replyId)
        .orElseThrow(() -> new ResourceNotFoundException("Reply not found with id: " + replyId));
  }

  private void validateReviewBelongsToAlbum(Review review, Long albumId) {
    if (!review.getAlbum().getId().equals(albumId)) {
      throw new IllegalArgumentException("Review does not belong to album with id: " + albumId);
    }
  }

  private void validateReplyBelongsToReview(ReviewReply reply, Long reviewId) {
    if (!reply.getReview().getId().equals(reviewId)) {
      throw new IllegalArgumentException("Reply does not belong to review with id: " + reviewId);
    }
  }

  private void validateReplyOwnership(ReviewReply reply, User user) {
    if (!reply.getUser().getId().equals(user.getId())) {
      throw new AccessDeniedException("You are not authorized to modify this reply");
    }
  }
}
