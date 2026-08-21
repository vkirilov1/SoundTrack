package org.soundtrack.api.chat.dto;

public record JoinRoomResponse(JoinStatus status, ChatRoomResponse room) {

  public enum JoinStatus {
    JOINED,
    REQUESTED
  }
}
