package org.soundtrack.api.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.dto.CreateRoomRequest;
import org.soundtrack.api.chat.dto.InviteRequest;
import org.soundtrack.api.chat.dto.JoinRoomResponse;
import org.soundtrack.api.chat.moderation.dto.ReportRoomRequest;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.dto.PagedResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Chat Rooms", description = "Live chat rooms - membership and management over REST")
public class ChatRoomController {

  private final ChatService chatService;

  @Operation(summary = "Create a new chat room (creator is auto-joined and becomes the owner)")
  @PostMapping
  public ResponseEntity<ChatRoomResponse> createRoom(
      @Valid @RequestBody CreateRoomRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createRoom(request));
  }

  @Operation(summary = "List all active chat rooms, newest first")
  @GetMapping
  public ResponseEntity<List<ChatRoomResponse>> getRooms() {
    return ResponseEntity.ok(chatService.getRooms());
  }

  @Operation(summary = "Get the room the caller is currently in (404 when not in any room)")
  @GetMapping("/me")
  public ResponseEntity<ChatRoomResponse> getMyRoom() {
    return ResponseEntity.ok(chatService.getMyRoom());
  }

  @Operation(summary = "Get a single chat room by ID")
  @GetMapping("/{roomId}")
  public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable("roomId") Long roomId) {
    return ResponseEntity.ok(chatService.getRoomById(roomId));
  }

  @Operation(
      summary = "Join a chat room",
      description =
          "Joins directly, or files a join request (status REQUESTED) when the room requires"
              + " approval and the caller has no invite. 409 when the room is full or the caller"
              + " is already in another room.")
  @PostMapping("/{roomId}/join")
  public ResponseEntity<JoinRoomResponse> joinRoom(@PathVariable("roomId") Long roomId) {
    return ResponseEntity.ok(chatService.joinRoom(roomId));
  }

  @Operation(summary = "Leave a chat room - the owner leaving closes the room for everyone")
  @DeleteMapping("/{roomId}/leave")
  public ResponseEntity<Void> leaveRoom(@PathVariable("roomId") Long roomId) {
    chatService.leaveRoom(roomId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Remove a member from the room (owner only)")
  @PostMapping("/{roomId}/kick/{userId}")
  public ResponseEntity<Void> kickMember(
      @PathVariable("roomId") Long roomId, @PathVariable("userId") Long userId) {
    chatService.kickMember(roomId, userId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Invite a user to the room (any member) - delivered as a notification")
  @PostMapping("/{roomId}/invite")
  public ResponseEntity<Void> inviteUser(
      @PathVariable("roomId") Long roomId, @Valid @RequestBody InviteRequest request) {
    chatService.inviteUser(roomId, request.userId());
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Approve a pending join request (owner only)")
  @PostMapping("/{roomId}/requests/{userId}/approve")
  public ResponseEntity<Void> approveRequest(
      @PathVariable("roomId") Long roomId, @PathVariable("userId") Long userId) {
    chatService.approveRequest(roomId, userId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Decline a pending join request (owner only)")
  @DeleteMapping("/{roomId}/requests/{userId}")
  public ResponseEntity<Void> declineRequest(
      @PathVariable("roomId") Long roomId, @PathVariable("userId") Long userId) {
    chatService.declineRequest(roomId, userId);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Fetch paginated message history for a room (members only)")
  @GetMapping("/{roomId}/messages")
  public ResponseEntity<PagedResponse<ChatMessageResponse>> getMessages(
      @PathVariable("roomId") Long roomId,
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "50") int size) {
    return ResponseEntity.ok(chatService.getRoomHistory(roomId, page, size));
  }

  @Operation(
      summary = "Report a room to admins (members only)",
      description = "Snapshots the room's recent messages into the moderation queue.")
  @PostMapping("/{roomId}/report")
  public ResponseEntity<Void> reportRoom(
      @PathVariable("roomId") Long roomId, @Valid @RequestBody ReportRoomRequest request) {
    chatService.reportRoom(roomId, request.category());
    return ResponseEntity.noContent().build();
  }
}
