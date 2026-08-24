package org.soundtrack.api.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.review.service.ReviewService;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AccountDeletionTokenRepository;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.EditRequestRepository;
import org.soundtrack.domain.repository.NotificationRepository;
import org.soundtrack.domain.repository.PasswordResetTokenRepository;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserPurgeServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private ReviewService reviewService;
  @Mock private ChatService chatService;
  @Mock private ChatMessageRepository chatMessageRepository;
  @Mock private NotificationRepository notificationRepository;
  @Mock private EditRequestRepository editRequestRepository;
  @Mock private RefreshTokenRepository refreshTokenRepository;
  @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
  @Mock private AccountDeletionTokenRepository accountDeletionTokenRepository;
  @Mock private PasswordEncoder passwordEncoder;

  private UserPurgeService userPurgeService;
  private final User user = User.builder().id(1L).build();

  @BeforeEach
  void setUp() {
    userPurgeService =
        new UserPurgeService(
            userRepository,
            reviewService,
            chatService,
            chatMessageRepository,
            notificationRepository,
            editRequestRepository,
            refreshTokenRepository,
            passwordResetTokenRepository,
            accountDeletionTokenRepository,
            passwordEncoder);
  }

  @Test
  void cascadesEveryCleanupStepForTheUser() {
    User placeholder = User.builder().id(2L).username("deleted-user").build();
    when(userRepository.findByUsername("deleted-user")).thenReturn(Optional.of(placeholder));

    userPurgeService.purge(user);

    verify(reviewService).deleteAllReviewsByUser(1L);
    verify(chatService).forceCloseRoomsCreatedBy(1L);
    verify(chatMessageRepository).reassignSender(1L, placeholder);
    verify(notificationRepository).deleteByRecipientId(1L);
    verify(notificationRepository).deleteByActorId(1L);
    verify(editRequestRepository).clearReviewedBy(1L);
    verify(editRequestRepository).deleteByRequestedById(1L);
    verify(refreshTokenRepository).deleteByUserId(1L);
    verify(passwordResetTokenRepository).deleteByUserId(1L);
    verify(accountDeletionTokenRepository).deleteByUserId(1L);
    verify(userRepository).delete(user);
  }

  @Test
  void reusesAnExistingPlaceholderAccount() {
    User placeholder = User.builder().id(2L).username("deleted-user").build();
    when(userRepository.findByUsername("deleted-user")).thenReturn(Optional.of(placeholder));

    userPurgeService.purge(user);

    verify(userRepository, never()).save(any());
  }

  @Test
  void createsThePlaceholderAccountOnFirstUse() {
    when(userRepository.findByUsername("deleted-user")).thenReturn(Optional.empty());
    when(passwordEncoder.encode(any())).thenReturn("hashed");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    userPurgeService.purge(user);

    ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(captor.capture());
    assertThat(captor.getValue().getUsername()).isEqualTo("deleted-user");
    assertThat(captor.getValue().getEmail()).isEqualTo("deleted-user@soundtrack.local");
    verify(chatMessageRepository).reassignSender(eq(1L), eq(captor.getValue()));
  }
}
