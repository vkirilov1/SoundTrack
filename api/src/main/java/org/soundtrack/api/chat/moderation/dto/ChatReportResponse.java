package org.soundtrack.api.chat.moderation.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.ChatReportCategory;
import org.soundtrack.domain.model.ChatReportResolution;
import org.soundtrack.domain.model.ChatReportStatus;

public record ChatReportResponse(
    Long id,
    String reporterUsername,
    Long roomId,
    String roomName,
    String topicName,
    ChatReportCategory category,
    ChatReportStatus status,
    String handledByUsername,
    String resolvedByUsername,
    ChatReportResolution resolution,
    LocalDateTime createdAt,
    LocalDateTime resolvedAt) {}
