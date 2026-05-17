package org.soundtrack.api.artist.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.service.ArtistService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
@Tag(name = "Artists", description = "Retrieve artist details")
public class ArtistController {

  private final ArtistService artistService;

  @GetMapping("/{id}")
  @Operation(
      summary = "Get artist by ID",
      description = "Returns artist profile including discography")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Artist found"),
    @ApiResponse(responseCode = "404", description = "Artist not found")
  })
  public ArtistResponse getArtist(
      @Parameter(description = "Internal artist ID") @PathVariable("id") Long id) {
    return artistService.getArtistById(id);
  }
}
