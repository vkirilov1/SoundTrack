package org.soundtrack.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.email.EmailService;
import org.soundtrack.domain.model.PasswordResetToken;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.PasswordResetTokenRepository;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
  @Mock private RefreshTokenRepository refreshTokenRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private EmailService emailService;

  private PasswordResetService passwordResetService;
  private final User user = User.builder().id(1L).email("user@example.com").build();

  @BeforeEach
  void setUp() {
    passwordResetService =
        new PasswordResetService(
            userRepository,
            passwordResetTokenRepository,
            refreshTokenRepository,
            passwordEncoder,
            emailService);
    ReflectionTestUtils.setField(passwordResetService, "frontendUrl", "https://app.example.com");
  }

  @Test
  void requestResetIsANoOpForAnUnknownEmail() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    passwordResetService.requestReset("ghost@example.com");

    verify(emailService, never()).sendPasswordResetEmail(any(), any());
  }

  @Test
  void requestResetInvalidatesPriorTokensAndEmailsAResetLink() {
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

    passwordResetService.requestReset("user@example.com");

    verify(passwordResetTokenRepository).invalidateAllForUser(1L);
    verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
    verify(emailService)
        .sendPasswordResetEmail(
            eq("user@example.com"), contains("https://app.example.com/reset-password?token="));
  }

  @Test
  void resetPasswordRejectsAnUnknownToken() {
    when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> passwordResetService.resetPassword("raw", "NewPass1!"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void resetPasswordRejectsAnAlreadyUsedToken() {
    PasswordResetToken token =
        PasswordResetToken.builder()
            .user(user)
            .used(true)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .build();
    when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> passwordResetService.resetPassword("raw", "NewPass1!"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void resetPasswordRejectsAnExpiredToken() {
    PasswordResetToken token =
        PasswordResetToken.builder()
            .user(user)
            .used(false)
            .expiresAt(LocalDateTime.now().minusMinutes(1))
            .build();
    when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> passwordResetService.resetPassword("raw", "NewPass1!"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void resetPasswordUpdatesThePasswordConsumesTheTokenAndKillsExistingSessions() {
    PasswordResetToken token =
        PasswordResetToken.builder()
            .user(user)
            .used(false)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .build();
    when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));
    when(passwordEncoder.encode("NewPass1!")).thenReturn("hashed-new-pass");

    passwordResetService.resetPassword("raw", "NewPass1!");

    assertThat(user.getPassword()).isEqualTo("hashed-new-pass");
    assertThat(token.isUsed()).isTrue();
    verify(refreshTokenRepository).revokeAllForUser(1L);
  }
}
