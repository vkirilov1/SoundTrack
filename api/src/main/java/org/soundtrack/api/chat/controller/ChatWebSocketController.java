package org.soundtrack.api.chat.controller;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.SendMessagePayload;
import org.soundtrack.api.chat.service.ChatRoomStateService;
import org.soundtrack.api.chat.service.ChatRoomStateService.SessionInfo;
import org.soundtrack.api.chat.service.ChatService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * STOMP-side of the chat: presence registration and message relay. Membership changes (join, leave,
 * kick, approvals) all happen over REST in {@link ChatRoomController}; here a client only announces
 * its live connection for a room and sends chat messages. JOIN/LEAVE system messages are broadcast
 * by the REST layer so reconnects (page refresh) don't spam the room.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

  private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

  private final ChatService chatService;
  private final ChatRoomStateService stateService;
  private final SimpMessagingTemplate messagingTemplate;

  /**
   * Client sends to /app/chat/{roomId}/join after subscribing to /topic/chat/{roomId}. Registers
   * live presence (cancelling any pending grace-period departure) - membership itself must already
   * exist via the REST join endpoint.
   */
  @MessageMapping("/chat/{roomId}/join")
  public void handlePresence(
      @DestinationVariable Long roomId,
      Principal principal,
      SimpMessageHeaderAccessor headerAccessor) {

    String email = resolveEmail(principal);
    if (email == null || !chatService.isMember(roomId, email)) {
      return;
    }

    stateService.registerPresence(headerAccessor.getSessionId(), email, roomId);
  }

  /**
   * Client sends to /app/chat/{roomId}/send. Persists the message (member check inside) and
   * broadcasts it to all room subscribers.
   */
  @MessageMapping("/chat/{roomId}/send")
  public void handleMessage(
      @DestinationVariable Long roomId, @Payload SendMessagePayload payload, Principal principal) {

    String email = resolveEmail(principal);
    if (email == null) {
      return;
    }

    try {
      ChatMessageResponse response = chatService.processMessage(roomId, payload, email);
      messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
    } catch (Exception e) {
      log.debug("Dropped chat message from {} to room {}: {}", email, roomId, e.getMessage());
    }
  }

  /**
   * Fires when a WebSocket session ends (browser close, refresh, network drop). If it was the
   * user's last session for a room, starts the grace-period countdown; only when that expires
   * without a reconnect is the user actually removed (and the room closed if they own it).
   */
  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());

    SessionInfo info = stateService.removeSession(sha.getSessionId());
    if (info == null) {
      return;
    }

    for (Long roomId : info.roomIds()) {
      if (!stateService.hasActiveSession(info.userEmail(), roomId)) {
        stateService.scheduleDeparture(
            info.userEmail(), roomId, () -> chatService.handleDeparture(info.userEmail(), roomId));
      }
    }
  }

  private String resolveEmail(Principal principal) {
    if (principal instanceof UsernamePasswordAuthenticationToken token
        && token.getPrincipal() instanceof UserDetails userDetails) {
      return userDetails.getUsername();
    }
    return principal != null ? principal.getName() : null;
  }
}
