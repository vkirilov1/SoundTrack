package org.soundtrack.api.review.mapper;

import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.dto.UserReviewResponse;
import org.soundtrack.domain.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

  public ReviewResponse toResponse(Review review) {
    return toResponse(review, false);
  }

  public ReviewResponse toResponse(Review review, boolean followedAuthor) {
    return ReviewResponse.builder()
        .id(review.getId())
        .rating(review.getRating())
        .title(review.getTitle())
        .comment(review.getComment())
        .username(review.getUser().getUsername())
        .userId(review.getUser().getId())
        .profilePictureUrl(review.getUser().getProfilePicture())
        .createdAt(review.getCreatedAt())
        .followedAuthor(followedAuthor)
        .build();
  }

  public UserReviewResponse toUserReviewResponse(Review review) {
    return UserReviewResponse.builder()
        .id(review.getId())
        .rating(review.getRating())
        .title(review.getTitle())
        .comment(review.getComment())
        .createdAt(review.getCreatedAt())
        .albumId(review.getAlbum().getId())
        .albumTitle(review.getAlbum().getTitle())
        .albumCoverUrl(review.getAlbum().getCoverUrl())
        .build();
  }
}
