package org.soundtrack.api.editrequest.mapper;

import org.soundtrack.api.editrequest.dto.EditRequestResponse;
import org.soundtrack.domain.model.EditRequest;
import org.springframework.stereotype.Component;

@Component
public class EditRequestMapper {

  public EditRequestResponse toResponse(
      EditRequest request, String targetName, String targetPhotoUrl) {
    return new EditRequestResponse(
        request.getId(),
        request.getTargetType(),
        request.getTargetId(),
        targetName,
        targetPhotoUrl,
        request.getProposedDescription(),
        request.getStatus(),
        request.getRequestedBy().getUsername(),
        request.getReviewedBy() != null ? request.getReviewedBy().getUsername() : null,
        request.getReviewedAt(),
        request.getCreatedAt());
  }
}
