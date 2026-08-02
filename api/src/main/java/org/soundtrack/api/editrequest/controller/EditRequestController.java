package org.soundtrack.api.editrequest.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.editrequest.dto.SubmitEditRequestRequest;
import org.soundtrack.api.editrequest.service.EditRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/edit-requests")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Edit Requests", description = "Suggest description edits for albums and artists")
public class EditRequestController {

  private final EditRequestService editRequestService;

  @PostMapping("/albums/{albumId}")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Suggest an album description edit",
      description = "Submits a proposed description for admin review.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Request submitted"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Album not found")
  })
  public void suggestAlbumEdit(
      @Parameter(description = "Internal album ID") @PathVariable("albumId") Long albumId,
      @Valid @RequestBody SubmitEditRequestRequest request,
      Authentication authentication) {
    editRequestService.submitAlbumDescriptionRequest(
        albumId, request.getDescription(), authentication.getName());
  }

  @PostMapping("/artists/{artistId}")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Suggest an artist description edit",
      description = "Submits a proposed biography for admin review.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Request submitted"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "401", description = "Not authenticated"),
    @ApiResponse(responseCode = "404", description = "Artist not found")
  })
  public void suggestArtistEdit(
      @Parameter(description = "Internal artist ID") @PathVariable("artistId") Long artistId,
      @Valid @RequestBody SubmitEditRequestRequest request,
      Authentication authentication) {
    editRequestService.submitArtistDescriptionRequest(
        artistId, request.getDescription(), authentication.getName());
  }
}
