package org.soundtrack.api.chat.service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Tracks which users currently have an active WebSocket connection open to each room.
 * Single-instance in-memory store - replace with Redis sorted sets when scaling horizontally.
 */
@Service
public class ChatRoomStateService {

  // roomId -> set of user emails currently connected
  private final ConcurrentHashMap<Long, Set<String>> activeUsersByRoom = new ConcurrentHashMap<>();

  // sessionId -> SessionInfo for cleanup on disconnect
  private final ConcurrentHashMap<String, SessionInfo> sessionIndex = new ConcurrentHashMap<>();

  public void addUserToRoom(String sessionId, String userEmail, Long roomId) {
    activeUsersByRoom.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(userEmail);
    sessionIndex
        .computeIfAbsent(sessionId, k -> new SessionInfo(userEmail, ConcurrentHashMap.newKeySet()))
        .roomIds()
        .add(roomId);
  }

  /** Returns the set of room IDs the session was active in, then removes it. */
  public SessionInfo removeSession(String sessionId) {
    SessionInfo info = sessionIndex.remove(sessionId);
    if (info == null) return null;

    for (Long roomId : info.roomIds()) {
      Set<String> users = activeUsersByRoom.get(roomId);
      if (users != null) {
        users.remove(info.userEmail());
        if (users.isEmpty()) {
          activeUsersByRoom.remove(roomId);
        }
      }
    }
    return info;
  }

  public int getActiveUserCount(Long roomId) {
    Set<String> users = activeUsersByRoom.get(roomId);
    return users != null ? users.size() : 0;
  }

  public Set<String> getActiveUsers(Long roomId) {
    return activeUsersByRoom.getOrDefault(roomId, Collections.emptySet());
  }

  public record SessionInfo(String userEmail, Set<Long> roomIds) {}
}
