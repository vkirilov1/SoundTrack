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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.auth.dto.LoginRequest;
import org.soundtrack.api.auth.dto.RegisterRequest;
import org.soundtrack.api.auth.service.AuthService.AuthResult;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtService jwtService;
  @Mock private RefreshTokenService refreshTokenService;

  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, passwordEncoder, jwtService, refreshTokenService);
  }

  private RegisterRequest registerRequest() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("new@example.com");
    request.setPassword("Sup3r$ecret");
    return request;
  }

  private LoginRequest loginRequest(boolean rememberMe) {
    LoginRequest request = new LoginRequest();
    request.setEmail("user@example.com");
    request.setPassword("Sup3r$ecret");
    request.setRememberMe(rememberMe);
    return request;
  }

  @Test
  void registerRejectsADuplicateEmail() {
    when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

    assertThatThrownBy(() -> authService.register(registerRequest()))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void registerRejectsADuplicateUsername() {
    when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
    when(userRepository.existsByUsername("newuser")).thenReturn(true);

    assertThatThrownBy(() -> authService.register(registerRequest()))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void registerAlwaysIssuesARefreshTokenRegardlessOfRememberMe() {
    when(userRepository.existsByEmail(any())).thenReturn(false);
    when(userRepository.existsByUsername(any())).thenReturn(false);
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(jwtService.generateToken("new@example.com")).thenReturn("access-token");
    when(refreshTokenService.issue(any(User.class))).thenReturn("refresh-token");

    AuthResult result = authService.register(registerRequest());

    assertThat(result.accessToken()).isEqualTo("access-token");
    assertThat(result.refreshToken()).isEqualTo("refresh-token");
    assertThat(result.rememberMe()).isTrue();
  }

  @Test
  void loginRejectsAnUnknownEmail() {
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authService.login(loginRequest(true)))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void loginRejectsAWrongPassword() {
    User user = User.builder().email("user@example.com").password("hashed").build();
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Sup3r$ecret", "hashed")).thenReturn(false);

    assertThatThrownBy(() -> authService.login(loginRequest(true)))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void loginRejectsADeletedAccount() {
    User user =
        User.builder()
            .email("user@example.com")
            .password("hashed")
            .deletedAt(LocalDateTime.now())
            .build();
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Sup3r$ecret", "hashed")).thenReturn(true);

    assertThatThrownBy(() -> authService.login(loginRequest(true)))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void loginWithoutRememberMeSkipsIssuingARefreshToken() {
    User user = User.builder().email("user@example.com").password("hashed").build();
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Sup3r$ecret", "hashed")).thenReturn(true);
    when(jwtService.generateToken("user@example.com")).thenReturn("access-token");

    AuthResult result = authService.login(loginRequest(false));

    assertThat(result.refreshToken()).isNull();
    verify(refreshTokenService, never()).issue(any());
  }

  @Test
  void loginWithRememberMeIssuesARefreshToken() {
    User user = User.builder().email("user@example.com").password("hashed").build();
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Sup3r$ecret", "hashed")).thenReturn(true);
    when(jwtService.generateToken("user@example.com")).thenReturn("access-token");
    when(refreshTokenService.issue(user)).thenReturn("refresh-token");

    AuthResult result = authService.login(loginRequest(true));

    assertThat(result.refreshToken()).isEqualTo("refresh-token");
  }

  @Test
  void refreshAlwaysIssuesANewRefreshToken() {
    User user = User.builder().email("user@example.com").build();
    when(refreshTokenService.consume("old-token")).thenReturn(user);
    when(jwtService.generateToken("user@example.com")).thenReturn("access-token");
    when(refreshTokenService.issue(user)).thenReturn("new-refresh-token");

    AuthResult result = authService.refresh("old-token");

    assertThat(result.refreshToken()).isEqualTo("new-refresh-token");
    assertThat(result.rememberMe()).isTrue();
  }

  @Test
  void logoutDelegatesToRefreshTokenService() {
    authService.logout("some-token");

    verify(refreshTokenService).revoke("some-token");
  }
}
