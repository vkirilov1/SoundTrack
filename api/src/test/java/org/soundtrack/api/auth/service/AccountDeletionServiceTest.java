package org.soundtrack.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.email.EmailService;
import org.soundtrack.api.user.service.UserPurgeService;
import org.soundtrack.domain.model.AccountDeletionToken;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AccountDeletionTokenRepository;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AccountDeletionServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private AccountDeletionTokenRepository accountDeletionTokenRepository;
  @Mock private RefreshTokenRepository refreshTokenRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private EmailService emailService;
  @Mock private UserPurgeService userPurgeService;

  private AccountDeletionService accountDeletionService;
  private final User user =
      User.builder().id(1L).email("user@example.com").password("hashed").build();

  @BeforeEach
  void setUp() {
    accountDeletionService =
        new AccountDeletionService(
            userRepository,
            accountDeletionTokenRepository,
            refreshTokenRepository,
            passwordEncoder,
            emailService,
            userPurgeService);
    ReflectionTestUtils.setField(accountDeletionService, "frontendUrl", "https://app.example.com");
  }

  @Test
  void requestDeletionRequiresAnExistingUser() {
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> accountDeletionService.requestDeletion("user@example.com", "pass"))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void requestDeletionRejectsAWrongPassword() {
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

    assertThatThrownBy(() -> accountDeletionService.requestDeletion("user@example.com", "wrong"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void requestDeletionRejectsAnAlreadyScheduledAccount() {
    User alreadyDeleted =
        User.builder()
            .id(1L)
            .email("user@example.com")
            .password("hashed")
            .deletedAt(LocalDateTime.now())
            .build();
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(alreadyDeleted));
    when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);

    assertThatThrownBy(() -> accountDeletionService.requestDeletion("user@example.com", "pass"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void requestDeletionMarksTheAccountRevokesSessionsAndEmailsARestoreLink() {
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);

    accountDeletionService.requestDeletion("user@example.com", "pass");

    assertThat(user.getDeletedAt()).isNotNull();
    verify(refreshTokenRepository).revokeAllForUser(1L);
    verify(accountDeletionTokenRepository).save(any(AccountDeletionToken.class));
    verify(emailService)
        .sendAccountDeletionEmail(
            org.mockito.ArgumentMatchers.eq("user@example.com"),
            org.mockito.ArgumentMatchers.contains(
                "https://app.example.com/restore-account?token="));
  }

  @Test
  void restoreAccountRejectsAnUnknownToken() {
    when(accountDeletionTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> accountDeletionService.restoreAccount("raw"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void restoreAccountRejectsAnExpiredToken() {
    User deletedUser = User.builder().id(1L).deletedAt(LocalDateTime.now()).build();
    AccountDeletionToken token =
        AccountDeletionToken.builder()
            .user(deletedUser)
            .used(false)
            .expiresAt(LocalDateTime.now().minusMinutes(1))
            .build();
    when(accountDeletionTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> accountDeletionService.restoreAccount("raw"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void restoreAccountRejectsAnAccountThatIsNotScheduledForDeletion() {
    User notDeletedUser = User.builder().id(1L).deletedAt(null).build();
    AccountDeletionToken token =
        AccountDeletionToken.builder()
            .user(notDeletedUser)
            .used(false)
            .expiresAt(LocalDateTime.now().plusDays(1))
            .build();
    when(accountDeletionTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> accountDeletionService.restoreAccount("raw"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void restoreAccountClearsDeletedAtAndConsumesTheToken() {
    User deletedUser = User.builder().id(1L).deletedAt(LocalDateTime.now()).build();
    AccountDeletionToken token =
        AccountDeletionToken.builder()
            .user(deletedUser)
            .used(false)
            .expiresAt(LocalDateTime.now().plusDays(1))
            .build();
    when(accountDeletionTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    accountDeletionService.restoreAccount("raw");

    assertThat(deletedUser.getDeletedAt()).isNull();
    assertThat(token.isUsed()).isTrue();
  }

  @Test
  void purgeExpiredAccountsPurgesEachAccountPastTheUndoWindow() {
    User expiredUser = User.builder().id(1L).build();
    when(userRepository.findByDeletedAtBefore(any())).thenReturn(List.of(expiredUser));

    accountDeletionService.purgeExpiredAccounts();

    verify(userPurgeService).purge(expiredUser);
  }

  @Test
  void purgeExpiredAccountsDoesNothingWhenNoneAreDue() {
    when(userRepository.findByDeletedAtBefore(any())).thenReturn(List.of());

    accountDeletionService.purgeExpiredAccounts();

    verify(userPurgeService, never()).purge(any());
  }
}
