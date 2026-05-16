package org.soundtrack.api.review.mapper;

import org.soundtrack.api.review.dto.ReviewResponse;
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
}
