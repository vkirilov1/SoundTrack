package org.soundtrack.api.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.AddArtistRequest;
import org.soundtrack.api.admin.dto.AddGenreRequest;
import org.soundtrack.api.admin.dto.AddSongArtistRequest;
import org.soundtrack.api.admin.dto.AddSongToAlbumRequest;
import org.soundtrack.api.admin.dto.AdminUserResponse;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.admin.dto.CreateArtistRequest;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.admin.dto.UpdateSongRequest;
import org.soundtrack.api.admin.service.AdminService;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.dto.SongResponse;
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

  @PostMapping("/albums")
  @Operation(
      summary = "Create an album",
      description =
          "Creates a new album from scratch (not sourced from MusicBrainz), with its artists,"
              + " genres, and songs. Use the cover-photo endpoint afterward to add a cover.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Album created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(
        responseCode = "404",
        description = "An artist referenced by the album or a song was not found")
  })
  public AlbumResponse createAlbum(@Valid @RequestBody CreateAlbumRequest request) {
    return adminService.createAlbum(request);
  }

  @GetMapping("/genres/search")
  @Operation(
      summary = "Search genres",
      description = "Autocomplete for the admin genre editor - matches existing genre names.")
  public List<String> searchGenres(
      @Parameter(description = "Search text") @RequestParam("q") String query) {
    return adminService.searchGenres(query);
  }

  @PostMapping("/albums/{albumId}/genres")
  @Operation(
      summary = "Add a genre to an album",
      description =
          "Links an existing genre (or creates it) to the album, weighted above its current tags.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Genre added"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album not found"),
    @ApiResponse(responseCode = "409", description = "Album already has this genre")
  })
  public AlbumResponse addGenre(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody AddGenreRequest request) {
    return adminService.addGenreToAlbum(albumId, request);
  }

  @DeleteMapping("/albums/{albumId}/genres/{genre}")
  @Operation(summary = "Remove a genre from an album")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Genre removed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album or genre not found")
  })
  public AlbumResponse removeGenre(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Genre name") @PathVariable("genre") String genre) {
    return adminService.removeGenreFromAlbum(albumId, genre);
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

  @PostMapping("/artists")
  @Operation(
      summary = "Create an artist",
      description = "Creates a new artist from scratch (not sourced from MusicBrainz).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin")
  })
  public ArtistResponse createArtist(@Valid @RequestBody CreateArtistRequest request) {
    return adminService.createArtist(request);
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

  @GetMapping("/artists/search")
  @Operation(
      summary = "Search artists",
      description = "Autocomplete for the admin artist editor - matches existing artist names.")
  public List<org.soundtrack.api.album.dto.ArtistResponse> searchArtists(
      @Parameter(description = "Search text") @RequestParam("q") String query) {
    return adminService.searchArtists(query);
  }

  @PostMapping("/albums/{albumId}/artists")
  @Operation(
      summary = "Add an artist to an album",
      description = "Links an existing artist to the album, credited after its current artists.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist added"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album or artist not found"),
    @ApiResponse(responseCode = "409", description = "Album already has this artist")
  })
  public AlbumResponse addArtist(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody AddArtistRequest request) {
    return adminService.addArtistToAlbum(albumId, request);
  }

  @DeleteMapping("/albums/{albumId}/artists/{artistId}")
  @Operation(
      summary = "Remove an artist from an album",
      description = "Fails if the artist is the album's only remaining credited artist.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist removed"),
    @ApiResponse(responseCode = "400", description = "Album must keep at least one artist"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album or artist not found")
  })
  public AlbumResponse removeArtist(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId) {
    return adminService.removeArtistFromAlbum(albumId, artistId);
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

  @PostMapping("/albums/{albumId}/songs")
  @Operation(
      summary = "Add a song to an album",
      description =
          "Adds a new track to an existing album, credited to the album's current artists.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Song added"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public SongResponse addSongToAlbum(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody AddSongToAlbumRequest request) {
    return adminService.addSongToAlbum(albumId, request);
  }

  @PutMapping("/songs/{songId}")
  @Operation(
      summary = "Edit song metadata",
      description = "Updates a song's title and/or duration.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Song updated"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Song not found")
  })
  public SongResponse updateSong(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId,
      @Valid @RequestBody UpdateSongRequest request) {
    return adminService.updateSong(songId, request);
  }

  @DeleteMapping("/songs/{songId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete a song")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Song deleted"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Song not found")
  })
  public void deleteSong(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId) {
    adminService.deleteSong(songId);
  }

  @PostMapping("/songs/{songId}/artists")
  @Operation(
      summary = "Add an artist to a song",
      description = "Links an existing artist to the song, credited after its current artists.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist added"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Song or artist not found"),
    @ApiResponse(responseCode = "409", description = "Song already has this artist")
  })
  public SongResponse addSongArtist(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId,
      @Valid @RequestBody AddSongArtistRequest request) {
    return adminService.addArtistToSong(songId, request);
  }

  @DeleteMapping("/songs/{songId}/artists/{artistId}")
  @Operation(
      summary = "Remove an artist from a song",
      description = "Fails if the artist is the song's only remaining credited artist.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist removed"),
    @ApiResponse(responseCode = "400", description = "Song must keep at least one artist"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "403", description = "Not an admin"),
    @ApiResponse(responseCode = "404", description = "Song or artist not found")
  })
  public SongResponse removeSongArtist(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId,
      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId) {
    return adminService.removeArtistFromSong(songId, artistId);
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
