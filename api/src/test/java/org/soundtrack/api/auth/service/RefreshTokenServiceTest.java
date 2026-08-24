package org.soundtrack.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.domain.model.RefreshToken;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

  @Mock private RefreshTokenRepository refreshTokenRepository;

  private RefreshTokenService refreshTokenService;
  private final User user = User.builder().id(1L).build();

  @BeforeEach
  void setUp() {
    refreshTokenService = new RefreshTokenService(refreshTokenRepository);
    ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", 604_800_000L);
  }

  @Test
  void issueReturnsARawTokenDifferentFromWhatIsPersisted() {
    ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);

    String rawToken = refreshTokenService.issue(user);

    verify(refreshTokenRepository).save(captor.capture());
    assertThat(captor.getValue().getTokenHash()).isNotEqualTo(rawToken);
    assertThat(captor.getValue().isRevoked()).isFalse();
  }

  @Test
  void consumeRejectsAnUnknownToken() {
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> refreshTokenService.consume("raw-token"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void consumeRevokesEverySessionWhenAnAlreadyRevokedTokenIsPresentedAgain() {
    RefreshToken token =
        RefreshToken.builder()
            .user(user)
            .revoked(true)
            .expiresAt(LocalDateTime.now().plusDays(1))
            .build();
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> refreshTokenService.consume("raw-token"))
        .isInstanceOf(InvalidCredentialsException.class);
    verify(refreshTokenRepository).revokeAllForUser(1L);
  }

  @Test
  void consumeRejectsAnExpiredToken() {
    RefreshToken token =
        RefreshToken.builder()
            .user(user)
            .revoked(false)
            .expiresAt(LocalDateTime.now().minusMinutes(1))
            .build();
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    assertThatThrownBy(() -> refreshTokenService.consume("raw-token"))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void consumeRotatesAValidTokenAndReturnsItsOwner() {
    RefreshToken token =
        RefreshToken.builder()
            .user(user)
            .revoked(false)
            .expiresAt(LocalDateTime.now().plusDays(1))
            .build();
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    User owner = refreshTokenService.consume("raw-token");

    assertThat(owner).isEqualTo(user);
    assertThat(token.isRevoked()).isTrue();
    verify(refreshTokenRepository).save(token);
  }

  @Test
  void revokeIsANoOpForAnUnknownToken() {
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    refreshTokenService.revoke("raw-token");

    verify(refreshTokenRepository, never()).save(any());
  }

  @Test
  void revokeMarksAKnownTokenAsRevoked() {
    RefreshToken token = RefreshToken.builder().user(user).revoked(false).build();
    when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

    refreshTokenService.revoke("raw-token");

    assertThat(token.isRevoked()).isTrue();
    verify(refreshTokenRepository).save(token);
  }

  @Test
  void exposesTheConfiguredExpirationMs() {
    assertThat(refreshTokenService.refreshExpirationMs()).isEqualTo(604_800_000L);
  }
}
