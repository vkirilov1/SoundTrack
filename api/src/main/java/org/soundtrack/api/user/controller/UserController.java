package org.soundtrack.api.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Retrieve user profiles")
public class UserController {

  private final UserService userService;

  @GetMapping("/{id}")
  @Operation(
      summary = "Get user profile by ID",
      description = "Returns the public profile of any user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "User found"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public UserProfileResponse getUser(
      @Parameter(description = "Internal user ID") @PathVariable Long id) {
    return userService.getById(id);
  }

  @GetMapping("/me")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get own profile",
      description = "Returns the profile of the currently authenticated user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Profile returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated")
  })
  public UserProfileResponse me(Authentication authentication) {
    String email = authentication.getName();
    return userService.getByEmail(email);
  }
}
