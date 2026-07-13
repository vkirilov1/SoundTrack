package org.soundtrack.api.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.dto.CreateRoomRequest;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.domain.model.TopicType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Chat Rooms", description = "Create and manage topic-based chat rooms")
public class ChatRoomController {

  private final ChatService chatService;

  @Operation(summary = "Create a new chat room (creator is auto-joined)")
  @PostMapping
  public ResponseEntity<ChatRoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createRoom(request));
  }

  @Operation(summary = "List chat rooms, optionally filtered by topic")
  @GetMapping
  public ResponseEntity<List<ChatRoomResponse>> getRooms(
      @Parameter(description = "Filter by topic type (ALBUM, ARTIST, SONG)")
          @RequestParam(required = false)
          TopicType topicType,
      @Parameter(description = "Filter by topic entity ID (requires topicType)")
          @RequestParam(required = false)
          Long topicId) {
    return ResponseEntity.ok(chatService.getRooms(topicType, topicId));
  }

  @Operation(summary = "Get a single chat room by ID")
  @GetMapping("/{roomId}")
  public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable Long roomId) {
    return ResponseEntity.ok(chatService.getRoomById(roomId));
  }

  @Operation(summary = "Join a chat room")
  @PostMapping("/{roomId}/join")
  public ResponseEntity<ChatRoomResponse> joinRoom(@PathVariable Long roomId) {
    return ResponseEntity.ok(chatService.joinRoom(roomId));
  }

  @Operation(summary = "Leave a chat room")
  @DeleteMapping("/{roomId}/leave")
  public ResponseEntity<Void> leaveRoom(@PathVariable Long roomId) {
    chatService.leaveRoom(roomId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Delete a chat room (creator only)")
  @DeleteMapping("/{roomId}")
  public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
    chatService.deleteRoom(roomId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Fetch paginated message history for a room")
  @GetMapping("/{roomId}/messages")
  public ResponseEntity<PagedResponse<ChatMessageResponse>> getMessages(
      @PathVariable Long roomId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {
    return ResponseEntity.ok(chatService.getRoomHistory(roomId, page, size));
  }
}
