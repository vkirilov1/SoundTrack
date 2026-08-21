package org.soundtrack.api.chat.moderation.dto;

import java.time.LocalDateTime;

public record ChatReportMessageResponse(
    String senderUsername, String content, LocalDateTime sentAt) {}
