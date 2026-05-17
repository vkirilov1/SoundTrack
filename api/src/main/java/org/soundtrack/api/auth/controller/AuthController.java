package org.soundtrack.api.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Authentication", description = "Register and log in to obtain a JWT token")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  @Operation(
      summary = "Register",
      description = "Creates a new user account and returns a JWT token")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Registration successful, JWT returned"),
    @ApiResponse(
        responseCode = "400",
        description = "Validation failed (password too weak, invalid email, etc.)"),
    @ApiResponse(responseCode = "409", description = "Email or username already in use")
  })
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  @Operation(
      summary = "Login",
      description = "Authenticates with email and password, returns a JWT token")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Login successful, JWT returned"),
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
  })
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }
}
