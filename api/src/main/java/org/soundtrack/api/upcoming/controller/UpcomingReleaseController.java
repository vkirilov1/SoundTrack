package org.soundtrack.api.upcoming.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.upcoming.dto.UpcomingReleaseResponse;
import org.soundtrack.api.upcoming.service.UpcomingReleaseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/upcoming-releases")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Upcoming Releases", description = "Admin-managed pre-announced releases for Drops")
public class UpcomingReleaseController {

  private final UpcomingReleaseService upcomingReleaseService;

  @PostMapping
  @Operation(
      summary = "Draft an upcoming release",
      description =
          "Same shape as creating an album - the Add Album modal routes here instead"
              + " when the release date is in the future.")
  public UpcomingReleaseResponse create(@Valid @RequestBody CreateAlbumRequest request) {
    return upcomingReleaseService.create(request);
  }

  @PostMapping("/{id}/photo")
  @Operation(summary = "Set an upcoming release's cover photo")
  public UpcomingReleaseResponse uploadPhoto(
      @PathVariable("id") Long id, @RequestParam("file") MultipartFile file) throws IOException {
    return upcomingReleaseService.uploadCoverPhoto(id, file);
  }

  @PostMapping("/{id}/publish")
  @Operation(
      summary = "Publish an upcoming release",
      description =
          "Promotes it into a real album. Only allowed once its release date has arrived.")
  public AlbumResponse publish(@PathVariable("id") Long id) {
    return upcomingReleaseService.publish(id);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Cancel an upcoming release before it's published")
  public void delete(@PathVariable("id") Long id) throws IOException {
    upcomingReleaseService.delete(id);
  }
}
