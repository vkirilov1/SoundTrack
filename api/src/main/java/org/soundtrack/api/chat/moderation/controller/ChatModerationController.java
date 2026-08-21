package org.soundtrack.api.chat.moderation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.moderation.dto.ChatReportDetailResponse;
import org.soundtrack.api.chat.moderation.dto.ChatReportResponse;
import org.soundtrack.api.chat.moderation.service.ChatModerationService;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.dto.PagedResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Chat Moderation", description = "Reports, room deletion, and chat-access control")
public class ChatModerationController {

  private final ChatModerationService chatModerationService;
  private final ChatService chatService;

  @GetMapping("/reports")
  @Operation(summary = "List chat moderation reports, newest first")
  public PagedResponse<ChatReportResponse> getReports(
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return chatModerationService.getReports(page, size);
  }

  @GetMapping("/reports/{reportId}")
  @Operation(summary = "Report detail, including its snapshotted context messages")
  public ChatReportDetailResponse getReportDetail(@PathVariable("reportId") Long reportId) {
    return chatModerationService.getReportDetail(reportId);
  }

  @PostMapping("/reports/{reportId}/dismiss")
  @Operation(summary = "Resolve a report without deleting its room")
  public ChatReportResponse dismissReport(
      @PathVariable("reportId") Long reportId, Authentication authentication) {
    return chatModerationService.dismissReport(reportId, authentication.getName());
  }

  @PostMapping("/rooms/{roomId}/delete")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      summary = "Delete a chat room",
      description =
          "Works whether or not the room has an open report - resolves one if present, otherwise"
              + " leaves an audit-trail entry.")
  public void deleteRoom(@PathVariable("roomId") Long roomId) {
    chatService.adminDeleteRoom(roomId);
  }

  @PostMapping("/users/{userId}/revoke")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Revoke a user's ability to create chat rooms")
  public void revokeChatAccess(@PathVariable("userId") Long userId, Authentication authentication) {
    chatModerationService.revokeChatAccess(userId, authentication.getName());
  }

  @PostMapping("/users/{userId}/restore")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Restore a user's ability to create chat rooms")
  public void restoreChatAccess(
      @PathVariable("userId") Long userId, Authentication authentication) {
    chatModerationService.restoreChatAccess(userId, authentication.getName());
  }
}
