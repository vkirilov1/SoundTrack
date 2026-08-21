package org.soundtrack.api.chat.dto;

import org.soundtrack.api.chat.dto.ChatRoomResponse.UserSummary;

/**
 * ROOM_CLOSED tells every client the owner ended the chat; JOIN_REQUEST carries the requesting user
 * for the owner's approve/decline UI; REQUEST_HANDLED tells owner clients to drop the entry for
 * {@code userId} after an approve or decline.
 */
public record ChatRoomEventResponse(EventType type, UserSummary user, Long userId) {

  public enum EventType {
    ROOM_CLOSED,
    JOIN_REQUEST,
    REQUEST_HANDLED
  }

  public static ChatRoomEventResponse roomClosed() {
    return new ChatRoomEventResponse(EventType.ROOM_CLOSED, null, null);
  }

  public static ChatRoomEventResponse joinRequest(UserSummary user) {
    return new ChatRoomEventResponse(EventType.JOIN_REQUEST, user, user.id());
  }

  public static ChatRoomEventResponse requestHandled(Long userId) {
    return new ChatRoomEventResponse(EventType.REQUEST_HANDLED, null, userId);
  }
}
