package org.soundtrack.api.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountDeletionService {

  private static final Logger log = LoggerFactory.getLogger(AccountDeletionService.class);

  private static final Duration UNDO_WINDOW = Duration.ofDays(30);

  private final UserRepository userRepository;
  private final AccountDeletionTokenRepository accountDeletionTokenRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;
  private final UserPurgeService userPurgeService;
  private final SecureRandom secureRandom = new SecureRandom();

  @Value("${app.frontend-url}")
  private String frontendUrl;

  @Transactional
  public void requestDeletion(String email, String rawPassword) {
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
      throw new InvalidCredentialsException("Incorrect password");
    }

    if (user.getDeletedAt() != null) {
      throw new InvalidOperationException("This account is already scheduled for deletion");
    }

    LocalDateTime now = LocalDateTime.now();
    user.setDeletedAt(now);
    userRepository.save(user);

    refreshTokenRepository.revokeAllForUser(user.getId());

    String rawToken = generateRawToken();
    AccountDeletionToken token =
        AccountDeletionToken.builder()
            .tokenHash(hash(rawToken))
            .user(user)
            .expiresAt(now.plus(UNDO_WINDOW))
            .used(false)
            .createdAt(now)
            .build();
    accountDeletionTokenRepository.save(token);

    String restoreLink = frontendUrl + "/restore-account?token=" + rawToken;
    emailService.sendAccountDeletionEmail(user.getEmail(), restoreLink);
  }

  @Transactional
  public void restoreAccount(String rawToken) {
    AccountDeletionToken token =
        accountDeletionTokenRepository
            .findByTokenHash(hash(rawToken))
            .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired restore link"));

    if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new InvalidCredentialsException("Invalid or expired restore link");
    }

    User user = token.getUser();
    if (user.getDeletedAt() == null) {
      throw new InvalidOperationException("This account isn't scheduled for deletion");
    }

    user.setDeletedAt(null);
    userRepository.save(user);

    token.setUsed(true);
    accountDeletionTokenRepository.save(token);
  }

  /** Runs daily - permanently erases any account whose 30-day undo window has passed. */
  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void purgeExpiredAccounts() {
    List<User> expired =
        userRepository.findByDeletedAtBefore(LocalDateTime.now().minus(UNDO_WINDOW));

    for (User user : expired) {
      userPurgeService.purge(user);
    }

    if (!expired.isEmpty()) {
      log.info("Purged {} account(s) past their 30-day deletion window", expired.size());
    }
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
