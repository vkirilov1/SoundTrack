package org.soundtrack.api.drops.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.drops.dto.CreateAlbumSuggestionRequest;
import org.soundtrack.api.drops.service.DropsService;
import org.soundtrack.api.upcoming.dto.UpcomingReleaseResponse;
import org.soundtrack.api.upcoming.service.UpcomingReleaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/drops")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Drops", description = "New/upcoming album suggestions")
public class DropsController {

  private final DropsService dropsService;
  private final UpcomingReleaseService upcomingReleaseService;

  @Operation(
      summary = "Suggest an album for Drops",
      description = "Files a suggestion for admins to review - does not add the album itself.")
  @PostMapping("/suggestions")
  public ResponseEntity<Void> suggestAlbum(
      @Valid @RequestBody CreateAlbumSuggestionRequest request) {
    dropsService.suggestAlbum(request);
    return ResponseEntity.noContent().build();
  }

  @Operation(
      summary = "Upcoming releases",
      description = "Admin-added releases with a future release date, soonest first.")
  @GetMapping("/upcoming")
  public PagedResponse<UpcomingReleaseResponse> getUpcoming(
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return upcomingReleaseService.getUpcomingReleases(page, size);
  }
}
