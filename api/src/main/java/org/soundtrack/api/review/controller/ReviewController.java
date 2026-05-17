package org.soundtrack.api.review.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.review.dto.CreateReviewReplyRequest;
import org.soundtrack.api.review.dto.CreateReviewRequest;
import org.soundtrack.api.review.dto.ReviewReplyResponse;
import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.service.ReviewReplyService;
import org.soundtrack.api.review.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@RestControllerAdvice
@Tag(name = "Reviews", description = "Create and manage album reviews")
public class ReviewController {

  private final ReviewService reviewService;
  private final ReviewReplyService reviewReplyService;

  // ---- Reviews ----

  @GetMapping("/{albumId}/reviews")
  @Operation(
      summary = "Get reviews for an album",
      description = "Returns a paginated list of reviews for the given album")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Reviews returned"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public PagedResponse<ReviewResponse> getAlbumReviews(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of reviews per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return reviewService.getAlbumReviews(albumId, page, size);
  }

  @PostMapping("/{albumId}/reviews")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Create a review",
      description = "Submits a new review for the given album. Requires authentication.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Review created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public ReviewResponse createReview(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody CreateReviewRequest request) {
    return reviewService.createReview(albumId, request);
  }

  @PutMapping("/{albumId}/reviews/{reviewId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Update a review",
      description = "Updates an existing review. Only the review's author may update it.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Review updated"),
    @ApiResponse(
        responseCode = "400",
        description = "Validation failed or review does not belong to this album"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the review's author"),
    @ApiResponse(responseCode = "404", description = "Review or album not found")
  })
  public ReviewResponse updateReview(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId,
      @Valid @RequestBody CreateReviewRequest request)
      throws BadRequestException {
    return reviewService.updateReview(albumId, reviewId, request);
  }

  @DeleteMapping("/{albumId}/reviews/{reviewId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Delete a review",
      description = "Deletes a review. Only the review's author may delete it.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Review deleted"),
    @ApiResponse(responseCode = "400", description = "Review does not belong to this album"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the review's author"),
    @ApiResponse(responseCode = "404", description = "Review not found")
  })
  public void deleteReview(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId)
      throws BadRequestException {
    reviewService.deleteReview(albumId, reviewId);
  }

  // ---- Replies ----

  @GetMapping("/{albumId}/reviews/{reviewId}/replies")
  @Operation(
      summary = "Get replies for a review",
      description = "Returns a paginated list of replies for the given review, oldest first.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Replies returned"),
    @ApiResponse(responseCode = "404", description = "Review or album not found")
  })
  public PagedResponse<ReviewReplyResponse> getReviewReplies(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of replies per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return reviewReplyService.getReviewReplies(albumId, reviewId, page, size);
  }

  @PostMapping("/{albumId}/reviews/{reviewId}/replies")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Post a reply to a review",
      description = "Adds a reply to the given review. Requires authentication.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Reply created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Review or album not found")
  })
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewReplyResponse createReply(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId,
      @Valid @RequestBody CreateReviewReplyRequest request) {
    return reviewReplyService.createReply(albumId, reviewId, request);
  }

  @PutMapping("/{albumId}/reviews/{reviewId}/replies/{replyId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Edit a reply",
      description = "Updates the message of a reply. Only the reply's author may edit it.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Reply updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the reply's author"),
    @ApiResponse(responseCode = "404", description = "Reply, review, or album not found")
  })
  public ReviewReplyResponse updateReply(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId,
      @Parameter(description = "Internal reply ID") @PathVariable("replyId") Long replyId,
      @Valid @RequestBody CreateReviewReplyRequest request) {
    return reviewReplyService.updateReply(albumId, reviewId, replyId, request);
  }

  @DeleteMapping("/{albumId}/reviews/{reviewId}/replies/{replyId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Delete a reply",
      description = "Deletes a reply. Only the reply's author may delete it.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Reply deleted"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not the reply's author"),
    @ApiResponse(responseCode = "404", description = "Reply, review, or album not found")
  })
  public void deleteReply(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId,
      @Parameter(description = "Internal reply ID") @PathVariable("replyId") Long replyId) {
    reviewReplyService.deleteReply(albumId, reviewId, replyId);
  }
}
