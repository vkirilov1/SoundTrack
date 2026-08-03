package org.soundtrack.api.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.AdminUserResponse;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.admin.service.AdminService;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.editrequest.dto.EditRequestResponse;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

  @DeleteMapping("/users/{userId}/photo")
  @Operation(
      summary = "Reset a user's profile photo",
      description =
          "Reverts the given user's profile photo to the default. For moderation of inappropriate images.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Photo reset"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public UserProfileResponse resetUserPhoto(
      @Parameter(description = "Internal user ID") @PathVariable("userId") Long userId)
      throws IOException {
    return adminService.resetUserPhoto(userId);
  }

  @PutMapping("/albums/{albumId}")
  @Operation(
      summary = "Edit album metadata",
      description = "Updates an album's title, release date, description, and/or cover URL.")
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

  @PostMapping("/albums/{albumId}/photo")
  @Operation(summary = "Replace an album's cover photo")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Cover updated"),
    @ApiResponse(responseCode = "400", description = "Invalid or missing file"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public AlbumResponse uploadAlbumPhoto(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @RequestParam("file") MultipartFile file)
      throws IOException {
    return adminService.uploadAlbumPhoto(albumId, file);
  }

  @PutMapping("/artists/{artistId}")
  @Operation(
      summary = "Edit artist metadata",
      description = "Updates an artist's name, country, type, and biography.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Artist not found")
  })
  public ArtistResponse updateArtist(
      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId,
      @Valid @RequestBody UpdateArtistRequest request) {
    return adminService.updateArtist(artistId, request);
  }

  @PostMapping("/artists/{artistId}/photo")
  @Operation(summary = "Replace an artist's photo")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Photo updated"),
    @ApiResponse(responseCode = "400", description = "Invalid or missing file"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Artist not found")
  })
  public ArtistResponse uploadArtistPhoto(
      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId,
      @RequestParam("file") MultipartFile file)
      throws IOException {
    return adminService.uploadArtistPhoto(artistId, file);
  }

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

  @GetMapping("/edit-requests")
  @Operation(
      summary = "List album/artist edit requests",
      description =
          "Returns all description-edit requests submitted by users, newest first — pending"
              + " and already-reviewed, kept for history.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Requests returned"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin")
  })
  public PagedResponse<EditRequestResponse> getEditRequests(
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of requests per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return adminService.getEditRequests(page, size);
  }

  @PostMapping("/edit-requests/{requestId}/approve")
  @Operation(
      summary = "Approve an edit request",
      description = "Applies the proposed description to the target album/artist.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Request approved"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Request not found"),
    @ApiResponse(responseCode = "409", description = "Request already reviewed")
  })
  public EditRequestResponse approveEditRequest(
      @Parameter(description = "Internal request ID") @PathVariable("requestId") Long requestId,
      Authentication authentication) {
    return adminService.approveEditRequest(requestId, authentication.getName());
  }

  @PostMapping("/edit-requests/{requestId}/reject")
  @Operation(summary = "Reject an edit request")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Request rejected"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Request not found"),
    @ApiResponse(responseCode = "409", description = "Request already reviewed")
  })
  public EditRequestResponse rejectEditRequest(
      @Parameter(description = "Internal request ID") @PathVariable("requestId") Long requestId,
      Authentication authentication) {
    return adminService.rejectEditRequest(requestId, authentication.getName());
  }
}
