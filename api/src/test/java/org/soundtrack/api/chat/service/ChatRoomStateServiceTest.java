package org.soundtrack.api.chat.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.soundtrack.api.chat.service.ChatRoomStateService.SessionInfo;

class ChatRoomStateServiceTest {

  private final ChatRoomStateService service = new ChatRoomStateService();

  @Test
  void hasNoActiveSessionBeforeRegistering() {
    assertThat(service.hasActiveSession("user@example.com", 1L)).isFalse();
  }

  @Test
  void registeringPresenceMarksTheSessionActive() {
    service.registerPresence("session-1", "user@example.com", 1L);

    assertThat(service.hasActiveSession("user@example.com", 1L)).isTrue();
  }

  @Test
  void aSessionCanTrackMultipleRooms() {
    service.registerPresence("session-1", "user@example.com", 1L);
    service.registerPresence("session-1", "user@example.com", 2L);

    assertThat(service.hasActiveSession("user@example.com", 1L)).isTrue();
    assertThat(service.hasActiveSession("user@example.com", 2L)).isTrue();
  }

  @Test
  void removingASessionReturnsItAndClearsItsPresence() {
    service.registerPresence("session-1", "user@example.com", 1L);

    SessionInfo removed = service.removeSession("session-1");

    assertThat(removed.userEmail()).isEqualTo("user@example.com");
    assertThat(removed.roomIds()).containsExactly(1L);
    assertThat(service.hasActiveSession("user@example.com", 1L)).isFalse();
  }

  @Test
  void removingAnUnknownSessionReturnsNull() {
    assertThat(service.removeSession("unknown")).isNull();
  }

  @Test
  void allowsMessagesUpToTheRateLimit() {
    for (int i = 0; i < 8; i++) {
      assertThat(service.allowMessage("user@example.com")).isTrue();
    }
  }

  @Test
  void blocksMessagesOnceTheRateLimitIsHit() {
    for (int i = 0; i < 8; i++) {
      service.allowMessage("user@example.com");
    }

    assertThat(service.allowMessage("user@example.com")).isFalse();
  }

  @Test
  void rateLimitsAreTrackedPerUser() {
    for (int i = 0; i < 8; i++) {
      service.allowMessage("user-one@example.com");
    }

    assertThat(service.allowMessage("user-two@example.com")).isTrue();
  }
}
