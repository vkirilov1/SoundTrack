package org.soundtrack.api.review.mapper;

import org.soundtrack.api.review.dto.ReviewReplyResponse;
import org.soundtrack.domain.model.ReviewReply;
import org.springframework.stereotype.Component;

@Component
public class ReviewReplyMapper {

  public ReviewReplyResponse toResponse(ReviewReply reply) {
    return ReviewReplyResponse.builder()
        .id(reply.getId())
        .message(reply.getMessage())
        .edited(reply.isEdited())
        .username(reply.getUser().getUsername())
        .createdAt(reply.getCreatedAt())
        .build();
  }
}
