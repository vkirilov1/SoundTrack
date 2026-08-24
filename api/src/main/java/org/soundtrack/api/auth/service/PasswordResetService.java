package org.soundtrack.api.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.email.EmailService;
import org.soundtrack.domain.model.PasswordResetToken;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.PasswordResetTokenRepository;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

  private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);

  private final UserRepository userRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;
  private final SecureRandom secureRandom = new SecureRandom();

  @Value("${app.frontend-url}")
  private String frontendUrl;

  /** Silently no-ops for an unknown email */
  @Transactional
  public void requestReset(String email) {
    userRepository
        .findByEmail(email)
        .ifPresent(
            user -> {
              passwordResetTokenRepository.invalidateAllForUser(user.getId());

              String rawToken = generateRawToken();
              PasswordResetToken token =
                  PasswordResetToken.builder()
                      .tokenHash(hash(rawToken))
                      .user(user)
                      .expiresAt(LocalDateTime.now().plus(TOKEN_LIFETIME))
                      .used(false)
                      .createdAt(LocalDateTime.now())
                      .build();
              passwordResetTokenRepository.save(token);

              String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
              emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            });
  }

  @Transactional
  public void resetPassword(String rawToken, String newPassword) {
    PasswordResetToken token =
        passwordResetTokenRepository
            .findByTokenHash(hash(rawToken))
            .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset link"));

    if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new InvalidCredentialsException("Invalid or expired reset link");
    }

    User user = token.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    token.setUsed(true);
    passwordResetTokenRepository.save(token);

    // A changed password should kill every existing session
    refreshTokenRepository.revokeAllForUser(user.getId());
  }

  private String generateRawToken() {
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String hash(String rawToken) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(hashed);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
