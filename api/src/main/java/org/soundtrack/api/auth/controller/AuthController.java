package org.soundtrack.api.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.auth.dto.LoginRequest;
import org.soundtrack.api.auth.dto.RegisterRequest;
import org.soundtrack.api.auth.service.AuthService;
import org.soundtrack.api.auth.service.AuthService.AuthResult;
import org.soundtrack.api.auth.util.CookieUtil;
import org.soundtrack.api.common.exception.InvalidCredentialsException;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(
    name = "Authentication",
    description = "Register, log in, and refresh sessions via httpOnly cookies")
public class AuthController {

  private static final String ACCESS_TOKEN_COOKIE = "access_token";
  private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
  private static final String REFRESH_TOKEN_PATH = "/api/auth";

  private final AuthService authService;
  private final UserService userService;

  @Value("${jwt.expiration}")
  private long accessExpirationMs;

  @Value("${security.cookie.secure}")
  private boolean cookieSecure;

  @PostMapping("/register")
  @Operation(
      summary = "Register",
      description = "Creates a new user account and starts a session")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Registration successful"),
    @ApiResponse(
        responseCode = "400",
        description = "Validation failed (password too weak, invalid email, etc.)"),
    @ApiResponse(responseCode = "409", description = "Email or username already in use")
  })
  public ResponseEntity<UserProfileResponse> register(
      @Valid @RequestBody RegisterRequest request) {
    return withSessionCookies(authService.register(request));
  }

  @PostMapping("/login")
  @Operation(
      summary = "Login",
      description = "Authenticates with email and password and starts a session")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Login successful"),
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
  })
  public ResponseEntity<UserProfileResponse> login(@Valid @RequestBody LoginRequest request) {
    return withSessionCookies(authService.login(request));
  }

  @PostMapping("/refresh")
  @Operation(
      summary = "Refresh",
      description = "Rotates the refresh token and issues a new access token")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Session refreshed"),
    @ApiResponse(responseCode = "401", description = "Missing, expired, or reused refresh token")
  })
  public ResponseEntity<UserProfileResponse> refresh(HttpServletRequest request) {
    String refreshToken =
        readCookie(request, REFRESH_TOKEN_COOKIE)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid session"));

    return withSessionCookies(authService.refresh(refreshToken));
  }

  @PostMapping("/logout")
  @Operation(
      summary = "Logout",
      description = "Revokes the current session and clears auth cookies")
  public ResponseEntity<Void> logout(HttpServletRequest request) {
    readCookie(request, REFRESH_TOKEN_COOKIE).ifPresent(authService::logout);

    return ResponseEntity.noContent()
        .header(
            HttpHeaders.SET_COOKIE,
            CookieUtil.clear(ACCESS_TOKEN_COOKIE, "/", cookieSecure).toString())
        .header(
            HttpHeaders.SET_COOKIE,
            CookieUtil.clear(REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_PATH, cookieSecure).toString())
        .build();
  }

  @GetMapping("/me")
  @Operation(summary = "Current user", description = "Returns the authenticated user's profile")
  public UserProfileResponse me(Authentication authentication) {
    return userService.getByEmail(authentication.getName());
  }

  private ResponseEntity<UserProfileResponse> withSessionCookies(AuthResult result) {
    ResponseCookie accessCookie =
        CookieUtil.build(
            ACCESS_TOKEN_COOKIE,
            result.accessToken(),
            "/",
            Duration.ofMillis(accessExpirationMs),
            cookieSecure);
    ResponseCookie refreshCookie =
        CookieUtil.build(
            REFRESH_TOKEN_COOKIE,
            result.refreshToken(),
            REFRESH_TOKEN_PATH,
            Duration.ofMillis(authService.refreshExpirationMs()),
            cookieSecure);

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
        .body(result.profile());
  }

  private Optional<String> readCookie(HttpServletRequest request, String name) {
    if (request.getCookies() == null) {
      return Optional.empty();
    }
    return Arrays.stream(request.getCookies())
        .filter(cookie -> name.equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst();
  }
}
