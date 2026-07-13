package org.soundtrack.api.common.exception;

public class ChatRoomFullException extends RuntimeException {

  public ChatRoomFullException(String message) {
    super(message);
  }
}
