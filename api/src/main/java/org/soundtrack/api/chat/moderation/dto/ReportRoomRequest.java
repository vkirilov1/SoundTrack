package org.soundtrack.api.chat.moderation.dto;

import jakarta.validation.constraints.NotNull;
import org.soundtrack.domain.model.ChatReportCategory;

public record ReportRoomRequest(@NotNull ChatReportCategory category) {}
