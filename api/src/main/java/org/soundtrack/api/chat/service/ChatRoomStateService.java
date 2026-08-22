package org.soundtrack.api.chat.service;

import jakarta.annotation.PreDestroy;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ChatRoomStateService {

  private static final Logger log = LoggerFactory.getLogger(ChatRoomStateService.class);

  /** How long a user's connection may stay dead before they are treated as having left */
  public static final long DEPARTURE_GRACE_SECONDS = 150;

  private static final int MAX_MESSAGES_PER_WINDOW = 8;

  private static final long RATE_WINDOW_MS = 10_000;

  private final ConcurrentHashMap<String, SessionInfo> sessionIndex = new ConcurrentHashMap<>();

  private final ConcurrentHashMap<String, ScheduledFuture<?>> pendingDepartures =
      new ConcurrentHashMap<>();

  private final ConcurrentHashMap<String, Deque<Long>> messageTimestampsByEmail =
      new ConcurrentHashMap<>();

  private final ScheduledExecutorService scheduler =
      Executors.newSingleThreadScheduledExecutor(
          runnable -> {
            Thread thread = new Thread(runnable, "chat-departure-scheduler");
            thread.setDaemon(true);
            return thread;
          });

  public void registerPresence(String sessionId, String userEmail, Long roomId) {
    sessionIndex
        .computeIfAbsent(sessionId, k -> new SessionInfo(userEmail, ConcurrentHashMap.newKeySet()))
        .roomIds()
        .add(roomId);

    ScheduledFuture<?> pending = pendingDepartures.remove(departureKey(userEmail, roomId));
    if (pending != null) {
      pending.cancel(false);
    }
  }

  public SessionInfo removeSession(String sessionId) {
    return sessionIndex.remove(sessionId);
  }

  public boolean hasActiveSession(String userEmail, Long roomId) {
    return sessionIndex.values().stream()
        .anyMatch(info -> info.userEmail().equals(userEmail) && info.roomIds().contains(roomId));
  }

  /**
   * Schedules {@code departureAction} to run after the grace period unless the user reconnects to
   * the room first. Re-scheduling for the same user+room replaces the previous task.
   */
  public void scheduleDeparture(String userEmail, Long roomId, Runnable departureAction) {
    String key = departureKey(userEmail, roomId);

    ScheduledFuture<?> task =
        scheduler.schedule(
            () -> {
              pendingDepartures.remove(key);
              if (hasActiveSession(userEmail, roomId)) {
                return;
              }
              try {
                departureAction.run();
              } catch (Exception e) {
                log.warn(
                    "Chat departure handling failed for {} in room {}: {}",
                    userEmail,
                    roomId,
                    e.getMessage());
              }
            },
            DEPARTURE_GRACE_SECONDS,
            TimeUnit.SECONDS);

    ScheduledFuture<?> previous = pendingDepartures.put(key, task);
    if (previous != null) {
      previous.cancel(false);
    }
  }

  private String departureKey(String userEmail, Long roomId) {
    return userEmail + "|" + roomId;
  }

  public boolean allowMessage(String userEmail) {
    Deque<Long> timestamps =
        messageTimestampsByEmail.computeIfAbsent(userEmail, k -> new ArrayDeque<>());
    long now = System.currentTimeMillis();

    synchronized (timestamps) {
      while (!timestamps.isEmpty() && now - timestamps.peekFirst() > RATE_WINDOW_MS) {
        timestamps.pollFirst();
      }
      if (timestamps.size() >= MAX_MESSAGES_PER_WINDOW) {
        return false;
      }
      timestamps.addLast(now);
      return true;
    }
  }

  @PreDestroy
  void shutdown() {
    scheduler.shutdownNow();
  }

  public record SessionInfo(String userEmail, Set<Long> roomIds) {}
}
