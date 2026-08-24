package org.soundtrack.api.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Notification;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.NotificationRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock private NotificationRepository notificationRepository;
  @Mock private UserRepository userRepository;

  private NotificationService notificationService;

  @BeforeEach
  void setUp() {
    notificationService = new NotificationService(notificationRepository, userRepository);
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  private void authenticateAs(String email) {
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(email, null, List.of()));
  }

  @Test
  void notifyIsANoOpWhenActorIsTheRecipient() {
    User user = User.builder().id(1L).build();

    notificationService.notify(user, user, NotificationType.FOLLOW, 1L, null);

    verify(notificationRepository, never()).save(any());
  }

  @Test
  void notifySavesANotificationForADifferentActor() {
    User recipient = User.builder().id(1L).build();
    User actor = User.builder().id(2L).username("actor").build();
    when(notificationRepository.save(any(Notification.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    notificationService.notify(recipient, actor, NotificationType.FOLLOW, 2L, null);

    verify(notificationRepository).save(any(Notification.class));
  }

  @Test
  void getNotificationsRequiresAuthentication() {
    SecurityContextHolder.getContext().setAuthentication(null);

    assertThatThrownBy(() -> notificationService.getNotifications(0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getNotificationsRequiresAKnownUser() {
    authenticateAs("ghost@example.com");
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> notificationService.getNotifications(0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getUnreadCountRejectsAnUnauthenticatedToken() {
    SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("x", "y"));
    SecurityContextHolder.getContext().getAuthentication().setAuthenticated(false);

    assertThatThrownBy(() -> notificationService.getUnreadCount())
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getUnreadCountDelegatesToRepositoryForTheAuthenticatedUser() {
    authenticateAs("a@b.com");
    when(userRepository.findByEmail("a@b.com"))
        .thenReturn(Optional.of(User.builder().id(1L).build()));
    when(notificationRepository.countByRecipientIdAndReadFalse(1L)).thenReturn(3L);

    long count = notificationService.getUnreadCount();

    assertThat(count).isEqualTo(3L);
  }
}
