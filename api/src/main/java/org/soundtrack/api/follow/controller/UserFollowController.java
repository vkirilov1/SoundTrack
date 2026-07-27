package org.soundtrack.api.follow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.follow.service.UserFollowService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Retrieve user profiles")
public class UserFollowController {

  private final UserFollowService userFollowService;

  @PostMapping("/{id}/follow")
  @ResponseStatus(HttpStatus.CREATED)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Follow a user",
      description = "Follow another user. Cannot follow yourself.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Now following the user"),
    @ApiResponse(responseCode = "400", description = "Cannot follow yourself"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "User not found"),
    @ApiResponse(responseCode = "409", description = "Already following this user")
  })
  public void follow(
      @Parameter(description = "ID of the user to follow") @PathVariable("id") Long id) {
    userFollowService.follow(id);
  }

  @DeleteMapping("/{id}/follow")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Unfollow a user", description = "Stop following a user.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Unfollowed successfully"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Not following this user")
  })
  public void unfollow(
      @Parameter(description = "ID of the user to unfollow") @PathVariable("id") Long id) {
    userFollowService.unfollow(id);
  }

  @GetMapping("/{id}/followers")
  @Operation(
      summary = "Get followers of a user",
      description =
          "Returns a paginated list of users who follow the given user. Publicly accessible.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Followers returned"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<UserProfileResponse> getFollowers(
      @Parameter(description = "Internal user ID") @PathVariable("id") Long id,
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return userFollowService.getFollowers(id, page, size);
  }

  @GetMapping("/{id}/following")
  @Operation(
      summary = "Get users followed by a user",
      description =
          "Returns a paginated list of users that the given user follows. Publicly accessible.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Following list returned"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<UserProfileResponse> getFollowing(
      @Parameter(description = "Internal user ID") @PathVariable("id") Long id,
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return userFollowService.getFollowing(id, page, size);
  }
}
