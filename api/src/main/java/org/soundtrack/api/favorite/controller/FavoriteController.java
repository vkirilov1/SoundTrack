package org.soundtrack.api.favorite.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.favorite.dto.FavoriteSongResponse;
import org.soundtrack.api.favorite.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Manage and view favorite albums and songs")
public class FavoriteController {

  private final FavoriteService favoriteService;

  @PostMapping("/albums/{albumId}")
  @ResponseStatus(HttpStatus.CREATED)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Add album to favorites",
      description = "Adds an album to the authenticated user's favorites.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Album added to favorites"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Album not found"),
    @ApiResponse(responseCode = "409", description = "Album already in favorites")
  })
  public void addFavoriteAlbum(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId) {
    favoriteService.addFavoriteAlbum(albumId);
  }

  @DeleteMapping("/albums/{albumId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Remove album from favorites",
      description = "Removes an album from the authenticated user's favorites.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Album removed from favorites"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Album not in favorites")
  })
  public void removeFavoriteAlbum(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId) {
    favoriteService.removeFavoriteAlbum(albumId);
  }

  @GetMapping("/albums/user/{userId}")
  @Operation(
      summary = "Get a user's favorite albums",
      description = "Returns a paginated list of a user's favorite albums. Publicly accessible.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Favorite albums returned"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<AlbumSummaryResponse> getFavoriteAlbumsByUser(
      @Parameter(description = "Internal user ID") @PathVariable("userId") Long userId,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of items per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return favoriteService.getFavoriteAlbumsByUser(userId, page, size);
  }

  @PostMapping("/songs/{songId}")
  @ResponseStatus(HttpStatus.CREATED)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Add song to favorites",
      description = "Adds a song to the authenticated user's favorites.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Song added to favorites"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Song not found"),
    @ApiResponse(responseCode = "409", description = "Song already in favorites")
  })
  public void addFavoriteSong(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId) {
    favoriteService.addFavoriteSong(songId);
  }

  @DeleteMapping("/songs/{songId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Remove song from favorites",
      description = "Removes a song from the authenticated user's favorites.")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Song removed from favorites"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Song not in favorites")
  })
  public void removeFavoriteSong(
      @Parameter(description = "Internal song ID") @PathVariable("songId") Long songId) {
    favoriteService.removeFavoriteSong(songId);
  }

  @GetMapping("/songs/user/{userId}")
  @Operation(
      summary = "Get a user's favorite songs",
      description = "Returns a paginated list of a user's favorite songs. Publicly accessible.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Favorite songs returned"),
    @ApiResponse(responseCode = "404", description = "User not found")
  })
  public PagedResponse<FavoriteSongResponse> getFavoriteSongsByUser(
      @Parameter(description = "Internal user ID") @PathVariable("userId") Long userId,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of items per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return favoriteService.getFavoriteSongsByUser(userId, page, size);
  }
}
