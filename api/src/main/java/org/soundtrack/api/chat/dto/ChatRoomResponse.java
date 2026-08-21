package org.soundtrack.api.chat.dto;

import java.time.LocalDateTime;
import java.util.List;
import org.soundtrack.domain.model.TopicType;

public record ChatRoomResponse(
    Long id,
    String name,
    TopicType topicType,
    Long topicId,
    String topicName,
    String topicImageUrl,
    UserSummary creator,
    LocalDateTime createdAt,
    boolean approvalRequired,
    int maxCapacity,
    int memberCount,
    List<UserSummary> members,
    MemberStatus myStatus,
    List<UserSummary> pendingRequests) {

  public enum MemberStatus {
    OWNER,
    MEMBER,
    PENDING,
    NONE
  }

  public record UserSummary(Long id, String username, String profilePicture) {}
}
