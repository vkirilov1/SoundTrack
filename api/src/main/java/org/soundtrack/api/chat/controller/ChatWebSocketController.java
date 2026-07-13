package org.soundtrack.api.chat.controller;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.SendMessagePayload;
import org.soundtrack.api.chat.service.ChatRoomStateService;
import org.soundtrack.api.chat.service.ChatRoomStateService.SessionInfo;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.domain.model.MessageType;
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

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

  private final ChatService chatService;
  private final ChatRoomStateService stateService;
  private final SimpMessagingTemplate messagingTemplate;

  /**
   * Client sends to /app/chat/{roomId}/join after subscribing to /topic/chat/{roomId}.
   * Registers active presence and broadcasts a JOIN system message to the room.
   */
  @MessageMapping("/chat/{roomId}/join")
  public void handleJoin(
      @DestinationVariable Long roomId,
      Principal principal,
      SimpMessageHeaderAccessor headerAccessor) {

    String email = resolveEmail(principal);
    String sessionId = headerAccessor.getSessionId();

    stateService.addUserToRoom(sessionId, email, roomId);

    ChatMessageResponse joinMsg = chatService.buildSystemMessage(roomId, email, MessageType.JOIN);
    messagingTemplate.convertAndSend("/topic/chat/" + roomId, joinMsg);
  }

  /**
   * Client sends to /app/chat/{roomId}/send.
   * Persists the message and broadcasts it to all room subscribers.
   */
  @MessageMapping("/chat/{roomId}/send")
  public void handleMessage(
      @DestinationVariable Long roomId,
      @Payload SendMessagePayload payload,
      Principal principal) {

    String email = resolveEmail(principal);
    ChatMessageResponse response = chatService.processMessage(roomId, payload, email);
    messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
  }

  /**
   * Fires when a WebSocket session ends (browser close, network drop, explicit disconnect).
   * Broadcasts LEAVE messages for each room the user was active in.
   */
  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = sha.getSessionId();

    SessionInfo info = stateService.removeSession(sessionId);
    if (info == null) return;

    for (Long roomId : info.roomIds()) {
      ChatMessageResponse leaveMsg =
          chatService.buildSystemMessage(roomId, info.userEmail(), MessageType.LEAVE);
      messagingTemplate.convertAndSend("/topic/chat/" + roomId, leaveMsg);
    }
  }

  private String resolveEmail(Principal principal) {
    UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
    UserDetails userDetails = (UserDetails) token.getPrincipal();
    return userDetails.getUsername(); // username == email in CustomUserDetailsService
  }
}
