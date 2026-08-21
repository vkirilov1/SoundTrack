package org.soundtrack.api.chat.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.MessageType;

public record ChatMessageResponse(
    Long id,
    Long roomId,
    Long senderId,
    String senderUsername,
    String senderProfilePicture,
    String content,
    LocalDateTime sentAt,
    MessageType messageType) {}
