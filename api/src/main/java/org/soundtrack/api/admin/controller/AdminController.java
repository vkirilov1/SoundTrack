package org.soundtrack.api.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.AdminUserResponse;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.admin.service.AdminService;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.common.dto.PagedResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Moderation and content management — requires ADMIN role")
public class AdminController {

  private final AdminService adminService;

  @GetMapping("/users")
  @Operation(
      summary = "List all users",
      description = "Returns a paginated list of all registered users with their email and role.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Users returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin")
  })
  public PagedResponse<AdminUserResponse> getUsers(
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of users per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return adminService.getUsers(page, size);
  }

  @DeleteMapping("/users/{userId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      summary = "Delete a user",
      description =
          "Permanently deletes a user along with all their reviews and lists."
              + " Album ratings are recalculated automatically.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "User deleted"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public void deleteUser(
      @Parameter(description = "Internal user ID") @PathVariable("userId") Long userId) {
    adminService.deleteUser(userId);
  }

  @PutMapping("/albums/{albumId}")
  @Operation(
      summary = "Edit album metadata",
      description = "Updates an album's title, release date, and/or cover URL.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Album updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public AlbumResponse updateAlbum(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody UpdateAlbumRequest request) {
    return adminService.updateAlbum(albumId, request);
  }

//  @PutMapping("/artists/{artistId}")
//  @Operation(
//      summary = "Edit artist metadata",
//      description = "Updates an artist's name, country, type, and biography.")
//  @ApiResponses({
//    @ApiResponse(responseCode = "200", description = "Artist updated"),
//    @ApiResponse(responseCode = "400", description = "Validation failed"),
//    @ApiResponse(responseCode = "401", description = "Not authenticated"),
//    @ApiResponse(responseCode = "403", description = "Not an admin"),
//    @ApiResponse(responseCode = "404", description = "Artist not found")
//  })
//  public ArtistResponse updateArtist(
//      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId,
//      @Valid @RequestBody UpdateArtistRequest request) {
//    return adminService.updateArtist(artistId, request);
//  }

  @DeleteMapping("/reviews/{reviewId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      summary = "Delete a review",
      description = "Removes any review regardless of author. Album rating is recalculated.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Review deleted"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Review not found")
  })
  public void deleteReview(
      @Parameter(description = "Internal review ID") @PathVariable("reviewId") Long reviewId) {
    adminService.deleteReview(reviewId);
  }
}
