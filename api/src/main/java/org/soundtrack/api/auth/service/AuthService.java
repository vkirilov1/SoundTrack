package org.soundtrack.api.auth.service;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.auth.dto.LoginRequest;
import org.soundtrack.api.auth.dto.RegisterRequest;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;

  public AuthResult register(RegisterRequest request) {

    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ResourceExistsException("Email already exists");
    }

    if (userRepository.existsByUsername(request.getUsername())) {
      throw new ResourceExistsException("Username already exists");
    }

    User user =
        User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(UserRole.USER)
            .joinDate(LocalDateTime.now())
            .build();

    userRepository.save(user);

    return issueSession(user);
  }

  public AuthResult login(LoginRequest request) {

    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

    boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

    if (!matches) {
      throw new InvalidCredentialsException("Invalid credentials");
    }

    return issueSession(user);
  }

  public AuthResult refresh(String refreshToken) {
    User user = refreshTokenService.consume(refreshToken);
    return issueSession(user);
  }

  public void logout(String refreshToken) {
    refreshTokenService.revoke(refreshToken);
  }

  public long refreshExpirationMs() {
    return refreshTokenService.refreshExpirationMs();
  }

  private AuthResult issueSession(User user) {
    String accessToken = jwtService.generateToken(user.getEmail());
    String refreshToken = refreshTokenService.issue(user);

    UserProfileResponse profile =
        new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getBio(),
            user.getProfilePicture(),
            user.getJoinDate());

    return new AuthResult(accessToken, refreshToken, profile);
  }

  public record AuthResult(String accessToken, String refreshToken, UserProfileResponse profile) {}
}
