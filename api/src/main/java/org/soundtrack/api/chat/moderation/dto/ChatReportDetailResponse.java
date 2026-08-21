package org.soundtrack.api.chat.moderation.dto;

import java.util.List;

public record ChatReportDetailResponse(
    ChatReportResponse report, List<ChatReportMessageResponse> messages) {}
