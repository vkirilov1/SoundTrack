package org.soundtrack.api.chat.moderation.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.moderation.dto.ChatReportDetailResponse;
import org.soundtrack.api.chat.moderation.dto.ChatReportMessageResponse;
import org.soundtrack.api.chat.moderation.dto.ChatReportResponse;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.ChatReportResolution;
import org.soundtrack.domain.model.ChatReportStatus;
import org.soundtrack.domain.model.ChatRoomReport;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.ChatReportMessageRepository;
import org.soundtrack.domain.repository.ChatRoomReportRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatModerationService {

  private final ChatRoomReportRepository chatRoomReportRepository;
  private final ChatReportMessageRepository chatReportMessageRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  @Transactional(readOnly = true)
  public PagedResponse<ChatReportResponse> getReports(int page, int size) {
    Page<ChatRoomReport> reportPage =
        chatRoomReportRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));

    List<ChatReportResponse> content =
        reportPage.getContent().stream().map(this::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, reportPage.getTotalElements(), reportPage.getTotalPages());
  }

  @Transactional(readOnly = true)
  public ChatReportDetailResponse getReportDetail(Long reportId) {
    ChatRoomReport report = findReport(reportId);

    List<ChatReportMessageResponse> messages =
        chatReportMessageRepository.findByReportIdOrderBySentAt(reportId).stream()
            .map(
                m ->
                    new ChatReportMessageResponse(
                        m.getSenderUsername(), m.getContent(), m.getSentAt()))
            .toList();

    return new ChatReportDetailResponse(toResponse(report), messages);
  }

  @Transactional
  public ChatReportResponse dismissReport(Long reportId, String adminEmail) {
    ChatRoomReport report = findReport(reportId);

    if (report.getStatus() == ChatReportStatus.RESOLVED) {
      throw new InvalidOperationException("This report has already been resolved");
    }

    report.setStatus(ChatReportStatus.RESOLVED);
    report.setResolution(ChatReportResolution.DISMISSED);
    report.setResolvedBy(findUserByEmail(adminEmail));
    report.setResolvedAt(LocalDateTime.now());

    return toResponse(chatRoomReportRepository.save(report));
  }

  @Transactional
  public void revokeChatAccess(Long userId, String adminEmail) {
    User user = findUserById(userId);
    if (user.isChatAccessRevoked()) {
      return;
    }

    user.setChatAccessRevoked(true);
    userRepository.save(user);

    notificationService.notify(
        user, findUserByEmail(adminEmail), NotificationType.CHAT_ACCESS_REVOKED, null, null);
  }

  @Transactional
  public void restoreChatAccess(Long userId, String adminEmail) {
    User user = findUserById(userId);
    if (!user.isChatAccessRevoked()) {
      return;
    }

    user.setChatAccessRevoked(false);
    userRepository.save(user);

    notificationService.notify(
        user, findUserByEmail(adminEmail), NotificationType.CHAT_ACCESS_RESTORED, null, null);
  }

  private ChatReportResponse toResponse(ChatRoomReport r) {
    return new ChatReportResponse(
        r.getId(),
        r.getReporter() != null ? r.getReporter().getUsername() : null,
        r.getRoomId(),
        r.getRoomName(),
        r.getTopicName(),
        r.getCategory(),
        r.getStatus(),
        r.getHandledBy() != null ? r.getHandledBy().getUsername() : null,
        r.getResolvedBy() != null ? r.getResolvedBy().getUsername() : null,
        r.getResolution(),
        r.getCreatedAt(),
        r.getResolvedAt());
  }

  private ChatRoomReport findReport(Long id) {
    return chatRoomReportRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
  }

  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private User findUserById(Long id) {
    return userRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
