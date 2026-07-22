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
import org.soundtrack.domain.model.RefreshToken;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;
  private final SecureRandom secureRandom = new SecureRandom();

  @Value("${jwt.refresh-expiration}")
  private long refreshExpirationMs;

  @Transactional
  public String issue(User user) {
    String rawToken = generateRawToken();

    RefreshToken entity =
        RefreshToken.builder()
            .tokenHash(hash(rawToken))
            .user(user)
            .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)))
            .revoked(false)
            .createdAt(LocalDateTime.now())
            .build();

    refreshTokenRepository.save(entity);
    return rawToken;
  }

  /**
   * Validates and rotates a refresh token, returning its owner. A revoked token being presented
   * again means it was already used once (or stolen) - treat that as compromise and kill every
   * session for the user.
   */
  @Transactional(noRollbackFor = InvalidCredentialsException.class)
  public User consume(String rawToken) {
    RefreshToken existing =
        refreshTokenRepository
            .findByTokenHash(hash(rawToken))
            .orElseThrow(() -> new InvalidCredentialsException("Invalid session"));

    if (existing.isRevoked()) {
      refreshTokenRepository.revokeAllForUser(existing.getUser().getId());
      throw new InvalidCredentialsException("Invalid session");
    }

    if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new InvalidCredentialsException("Invalid session");
    }

    existing.setRevoked(true);
    refreshTokenRepository.save(existing);

    return existing.getUser();
  }

  @Transactional
  public void revoke(String rawToken) {
    refreshTokenRepository
        .findByTokenHash(hash(rawToken))
        .ifPresent(
            token -> {
              token.setRevoked(true);
              refreshTokenRepository.save(token);
            });
  }

  public long refreshExpirationMs() {
    return refreshExpirationMs;
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
