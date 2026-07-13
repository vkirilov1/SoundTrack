package org.soundtrack.api.chat.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.TopicType;

public record ChatRoomResponse(
    Long id,
    String name,
    TopicType topicType,
    Long topicId,
    UserSummary creator,
    LocalDateTime createdAt,
    int maxCapacity,
    int memberCount,
    int activeUserCount) {

  public record UserSummary(Long id, String username, String profilePicture) {}
}
