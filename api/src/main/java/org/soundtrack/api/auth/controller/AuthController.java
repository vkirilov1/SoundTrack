package org.soundtrack.api.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.auth.dto.AuthResponse;
import org.soundtrack.api.auth.dto.LoginRequest;
import org.soundtrack.api.auth.dto.RegisterRequest;
import org.soundtrack.api.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }
}
