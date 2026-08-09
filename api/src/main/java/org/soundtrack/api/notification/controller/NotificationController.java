package org.soundtrack.api.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.notification.dto.NotificationResponse;
import org.soundtrack.api.notification.service.NotificationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Real-time and paged access to the user's notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @Operation(
      summary = "Subscribe to live notifications",
      description =
          "Opens a Server-Sent Events stream that pushes new notifications as they happen.")
  public SseEmitter stream() {
    return notificationService.subscribe();
  }

  @GetMapping
  @Operation(
      summary = "Get notifications",
      description =
          "Returns the authenticated user's notifications, newest first, and marks them read.")
  public PagedResponse<NotificationResponse> getNotifications(
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return notificationService.getNotifications(page, size);
  }

  @GetMapping("/unread-count")
  @Operation(
      summary = "Get unread notification count",
      description =
          "Snapshot used to seed the bell badge on load, before the live stream takes over.")
  public long getUnreadCount() {
    return notificationService.getUnreadCount();
  }

  @DeleteMapping
  @Operation(
      summary = "Clear notifications",
      description = "Deletes all of the user's notifications.")
  public void clearAll() {
    notificationService.clearAll();
  }
}
