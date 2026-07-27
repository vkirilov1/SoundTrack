package org.soundtrack.api.review.mapper;

import org.soundtrack.api.review.dto.ReviewResponse;
import org.soundtrack.api.review.dto.UserReviewResponse;
import org.soundtrack.domain.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

  public ReviewResponse toResponse(Review review) {
    return ReviewResponse.builder()
        .id(review.getId())
        .rating(review.getRating())
        .title(review.getTitle())
        .comment(review.getComment())
        .edited(review.isEdited())
        .username(review.getUser().getUsername())
        .createdAt(review.getCreatedAt())
        .build();
  }

  public UserReviewResponse toUserReviewResponse(Review review) {
    return UserReviewResponse.builder()
        .id(review.getId())
        .rating(review.getRating())
        .title(review.getTitle())
        .comment(review.getComment())
        .edited(review.isEdited())
        .createdAt(review.getCreatedAt())
        .albumId(review.getAlbum().getId())
        .albumTitle(review.getAlbum().getTitle())
        .albumCoverUrl(review.getAlbum().getCoverUrl())
        .build();
  }
}
