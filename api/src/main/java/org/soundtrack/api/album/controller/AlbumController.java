package org.soundtrack.api.album.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.service.AlbumService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@Tag(name = "Albums", description = "Retrieve album details")
public class AlbumController {

  private final AlbumService albumService;

  @GetMapping("/{id}")
  @Operation(
      summary = "Get album by ID",
      description = "Returns full album details including artists, genres, and track listing")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Album found"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public AlbumResponse getAlbum(
      @Parameter(description = "Internal album ID") @PathVariable("id") Long id) {
    return albumService.getAlbumById(id);
  }
}
