package org.soundtrack.api.notification.service;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.notification.dto.NotificationActorResponse;
import org.soundtrack.api.notification.dto.NotificationResponse;
import org.soundtrack.domain.model.Notification;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.NotificationRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Delivers notifications over Server-Sent Events: one open {@link SseEmitter} per logged-in tab,
 * tracked in an in-memory registry keyed by user id. No message broker - a notification is
 * persisted, then pushed directly to whichever emitters are currently open for that recipient. Only
 * works within a single app instance (fine here; would need a broker or a shared pub/sub if this
 * ever runs behind multiple instances).
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

  private static final long EMITTER_TIMEOUT_MS = Duration.ofMinutes(10).toMillis();

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  private final Map<Long, List<SseEmitter>> emittersByUserId = new ConcurrentHashMap<>();

  /** Opens a new SSE stream for the authenticated user and registers it for pushes. */
  public SseEmitter subscribe() {
    Long userId = requireAuthenticatedUserId();

    SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);

    emittersByUserId.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);

    emitter.onCompletion(() -> removeEmitter(userId, emitter));
    emitter.onTimeout(emitter::complete);
    emitter.onError(e -> removeEmitter(userId, emitter));

    try {
      emitter.send(SseEmitter.event().name("connected").data("ok"));
    } catch (IOException e) {
      emitter.completeWithError(e);
    }

    return emitter;
  }

  private void removeEmitter(Long userId, SseEmitter emitter) {
    List<SseEmitter> emitters = emittersByUserId.get(userId);
    if (emitters == null) return;

    emitters.remove(emitter);
    if (emitters.isEmpty()) {
      emittersByUserId.remove(userId);
    }
  }

  /**
   * Creates and persists a notification for {@code recipient}, then pushes it live to any open SSE
   * streams they currently have. {@code context} is an optional freeform label snapshotted at
   * creation time for display (e.g. an album title) - pass null when the notification's message
   * doesn't need one.
   */
  @Transactional
  public void notify(
      User recipient, User actor, NotificationType type, Long entityId, String context) {
    if (recipient.getId().equals(actor.getId())) {
      return;
    }

    Notification notification =
        notificationRepository.save(
            Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .entityId(entityId)
                .context(context)
                .read(false)
                .build());

    // Live delivery is best-effort - a dead browser connection must never fail the caller's
    // transaction (e.g. an admin deleting a review), so nothing from push() is allowed to escape.
    try {
      push(recipient.getId(), toResponse(notification));
    } catch (Exception e) {
      log.warn(
          "Failed to push live notification to user {}: {}", recipient.getId(), e.getMessage());
    }
  }

  private void push(Long recipientId, NotificationResponse response) {
    List<SseEmitter> emitters = emittersByUserId.get(recipientId);
    if (emitters == null || emitters.isEmpty()) return;

    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().name("notification").data(response));
      } catch (Exception e) {
        log.debug(
            "Dropping stale notification emitter for user {}: {}", recipientId, e.getMessage());
        removeEmitter(recipientId, emitter);
        emitter.completeWithError(e);
      }
    }
  }

  /** Returns the authenticated user's notifications, newest first, and marks them all as read. */
  @Transactional
  public PagedResponse<NotificationResponse> getNotifications(int page, int size) {
    Long userId = requireAuthenticatedUserId();

    Page<Notification> notificationPage =
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
            userId, PageRequest.of(page, size));

    List<NotificationResponse> content =
        notificationPage.getContent().stream().map(this::toResponse).toList();

    notificationRepository.markAllAsRead(userId);

    return new PagedResponse<>(
        content, page, size, notificationPage.getTotalElements(), notificationPage.getTotalPages());
  }

  /**
   * Unread count as of right now - used once on load to seed the bell badge before SSE takes over.
   */
  @Transactional(readOnly = true)
  public long getUnreadCount() {
    return notificationRepository.countByRecipientIdAndReadFalse(requireAuthenticatedUserId());
  }

  @Transactional
  public void clearAll() {
    notificationRepository.deleteByRecipientId(requireAuthenticatedUserId());
  }

  private NotificationResponse toResponse(Notification notification) {
    User actor = notification.getActor();
    return new NotificationResponse(
        notification.getId(),
        notification.getType(),
        new NotificationActorResponse(
            actor.getId(), actor.getUsername(), actor.getProfilePicture()),
        notification.getEntityId(),
        notification.getContext(),
        notification.isRead(),
        notification.getCreatedAt());
  }

  private Long requireAuthenticatedUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ResourceNotFoundException("User not found");
    }

    return userRepository
        .findByEmail(authentication.getName())
        .map(User::getId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
