package org.soundtrack.api.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.review.dto.UserReviewResponse;
import org.soundtrack.api.review.service.ReviewService;
import org.soundtrack.api.user.dto.UpdateProfileRequest;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Retrieve user profiles")
public class UserController {

  private final UserService userService;
  private final ReviewService reviewService;

  @GetMapping("/{id}")
  @Operation(
      summary = "Get user profile by ID",
      description = "Returns the public profile of any user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "User found"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public UserProfileResponse getUser(
      @Parameter(description = "Internal user ID") @PathVariable("id") Long id) {
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

  @PutMapping("/me/profile")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Update own profile",
      description = "Updates the display name (username) and bio of the authenticated user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Profile updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "409", description = "Username already taken")
  })
  public UserProfileResponse updateProfile(
      Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
    return userService.updateProfile(authentication.getName(), request);
  }

  @PostMapping("/me/photo")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Upload profile photo",
      description = "Replaces the authenticated user's profile photo")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Photo updated"),
    @ApiResponse(responseCode = "400", description = "Invalid or missing file"),
    @ApiResponse(responseCode = "401", description = "Not authenticated")
  })
  public UserProfileResponse uploadPhoto(
      Authentication authentication, @RequestParam("file") MultipartFile file) throws IOException {
    return userService.updatePhoto(authentication.getName(), file);
  }

  @DeleteMapping("/me/photo")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Reset profile photo",
      description = "Reverts the authenticated user's profile photo to the default")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Photo reset"),
    @ApiResponse(responseCode = "401", description = "Not authenticated")
  })
  public UserProfileResponse resetPhoto(Authentication authentication) throws IOException {
    return userService.resetPhoto(authentication.getName());
  }

  @GetMapping("/{id}/reviews")
  @Operation(
      summary = "Get reviews by user",
      description = "Returns a paginated list of reviews written by the given user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Reviews returned"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<UserReviewResponse> getUserReviews(
      @Parameter(description = "Internal user ID") @PathVariable("id") Long id,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of reviews per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return reviewService.getUserReviews(id, page, size);
  }
}
