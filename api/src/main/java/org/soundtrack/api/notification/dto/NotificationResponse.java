package org.soundtrack.api.notification.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.NotificationType;

public record NotificationResponse(
    Long id,
    NotificationType type,
    NotificationActorResponse actor,
    Long entityId,
    String context,
    boolean read,
    LocalDateTime createdAt) {}
