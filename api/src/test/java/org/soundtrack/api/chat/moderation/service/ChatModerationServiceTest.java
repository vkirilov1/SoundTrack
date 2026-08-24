package org.soundtrack.api.chat.moderation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chat.moderation.dto.ChatReportResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.ChatReportStatus;
import org.soundtrack.domain.model.ChatRoomReport;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.ChatReportMessageRepository;
import org.soundtrack.domain.repository.ChatRoomReportRepository;
import org.soundtrack.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ChatModerationServiceTest {

  @Mock private ChatRoomReportRepository chatRoomReportRepository;
  @Mock private ChatReportMessageRepository chatReportMessageRepository;
  @Mock private UserRepository userRepository;
  @Mock private NotificationService notificationService;

  private ChatModerationService chatModerationService;
  private final User admin = User.builder().id(1L).username("admin").build();

  @BeforeEach
  void setUp() {
    chatModerationService =
        new ChatModerationService(
            chatRoomReportRepository,
            chatReportMessageRepository,
            userRepository,
            notificationService);
  }

  @Test
  void getReportDetailRequiresAnExistingReport() {
    when(chatRoomReportRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> chatModerationService.getReportDetail(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void dismissReportRejectsAnAlreadyResolvedReport() {
    ChatRoomReport report =
        ChatRoomReport.builder()
            .id(1L)
            .roomId(1L)
            .roomName("r")
            .status(ChatReportStatus.RESOLVED)
            .build();
    when(chatRoomReportRepository.findById(1L)).thenReturn(Optional.of(report));

    assertThatThrownBy(() -> chatModerationService.dismissReport(1L, "admin@b.com"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void dismissReportResolvesAnOpenReport() {
    ChatRoomReport report =
        ChatRoomReport.builder()
            .id(1L)
            .roomId(1L)
            .roomName("r")
            .status(ChatReportStatus.OPEN)
            .build();
    when(chatRoomReportRepository.findById(1L)).thenReturn(Optional.of(report));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(chatRoomReportRepository.save(report)).thenReturn(report);

    ChatReportResponse response = chatModerationService.dismissReport(1L, "admin@b.com");

    assertThat(response.status()).isEqualTo(ChatReportStatus.RESOLVED);
    assertThat(report.getResolvedBy()).isEqualTo(admin);
  }

  @Test
  void revokeChatAccessIsANoOpWhenAlreadyRevoked() {
    User alreadyRevoked = User.builder().id(2L).chatAccessRevoked(true).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(alreadyRevoked));

    chatModerationService.revokeChatAccess(2L, "admin@b.com");

    verify(userRepository, never()).save(any());
    verify(notificationService, never()).notify(any(), any(), any(), any(), any());
  }

  @Test
  void revokeChatAccessMarksTheUserAndNotifiesThem() {
    User target = User.builder().id(2L).chatAccessRevoked(false).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));

    chatModerationService.revokeChatAccess(2L, "admin@b.com");

    assertThat(target.isChatAccessRevoked()).isTrue();
    verify(notificationService)
        .notify(target, admin, NotificationType.CHAT_ACCESS_REVOKED, null, null);
  }

  @Test
  void restoreChatAccessIsANoOpWhenNotRevoked() {
    User notRevoked = User.builder().id(2L).chatAccessRevoked(false).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(notRevoked));

    chatModerationService.restoreChatAccess(2L, "admin@b.com");

    verify(userRepository, never()).save(any());
  }

  @Test
  void restoreChatAccessClearsTheFlagAndNotifies() {
    User target = User.builder().id(2L).chatAccessRevoked(true).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));

    chatModerationService.restoreChatAccess(2L, "admin@b.com");

    assertThat(target.isChatAccessRevoked()).isFalse();
    verify(notificationService)
        .notify(target, admin, NotificationType.CHAT_ACCESS_RESTORED, null, null);
  }
}
