package org.soundtrack.api.review.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.review.dto.CreateReviewRequest;
import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@RestControllerAdvice
public class ReviewController {

  private final ReviewService reviewService;

  @GetMapping("/{albumId}/reviews")
  public PagedResponse<ReviewResponse> getAlbumReviews(
      @PathVariable("albumId") Long albumId,
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return reviewService.getAlbumReviews(albumId, page, size);
  }

  @PostMapping("/{albumId}/reviews")
  public ReviewResponse createReview(
      @PathVariable("albumId") Long albumId, @Valid @RequestBody CreateReviewRequest request) {
    return reviewService.createReview(albumId, request);
  }

  @PutMapping("/{albumId}/reviews/{reviewId}")
  public ReviewResponse updateReview(
      @PathVariable("albumId") Long albumId,
      @PathVariable("reviewId") Long reviewId,
      @Valid @RequestBody CreateReviewRequest request)
      throws BadRequestException {
    return reviewService.updateReview(albumId, reviewId, request);
  }

  @DeleteMapping("/{albumId}/reviews/{reviewId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteReview(
      @PathVariable("albumId") Long albumId, @PathVariable("reviewId") Long reviewId)
      throws BadRequestException {
    reviewService.deleteReview(albumId, reviewId);
  }
}
