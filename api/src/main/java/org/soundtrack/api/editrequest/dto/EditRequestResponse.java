package org.soundtrack.api.editrequest.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.EditRequestStatus;
import org.soundtrack.domain.model.EditRequestTargetType;

public record EditRequestResponse(
    Long id,
    EditRequestTargetType targetType,
    Long targetId,
    String targetName,
    String targetPhotoUrl,
    String proposedDescription,
    EditRequestStatus status,
    String requestedByUsername,
    Long requestedByUserId,
    String reviewedByUsername,
    LocalDateTime reviewedAt,
    LocalDateTime createdAt) {}
