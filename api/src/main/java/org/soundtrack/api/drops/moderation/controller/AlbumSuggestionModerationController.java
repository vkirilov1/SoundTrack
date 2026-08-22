package org.soundtrack.api.drops.moderation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.drops.dto.AlbumSuggestionResponse;
import org.soundtrack.api.drops.moderation.service.AlbumSuggestionModerationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/drops")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Drops Moderation", description = "Review user-submitted album suggestions")
public class AlbumSuggestionModerationController {

  private final AlbumSuggestionModerationService albumSuggestionModerationService;

  @GetMapping("/suggestions")
  @Operation(summary = "List submitted album suggestions, newest first")
  public PagedResponse<AlbumSuggestionResponse> getSuggestions(
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "20") int size) {
    return albumSuggestionModerationService.getSuggestions(page, size);
  }

  @PostMapping("/suggestions/{suggestionId}/approve")
  @Operation(summary = "Approve a suggestion - notifies the submitter")
  public AlbumSuggestionResponse approve(
      @PathVariable("suggestionId") Long suggestionId, Authentication authentication) {
    return albumSuggestionModerationService.approve(suggestionId, authentication.getName());
  }

  @PostMapping("/suggestions/{suggestionId}/reject")
  @Operation(summary = "Reject a suggestion - notifies the submitter")
  public AlbumSuggestionResponse reject(
      @PathVariable("suggestionId") Long suggestionId, Authentication authentication) {
    return albumSuggestionModerationService.reject(suggestionId, authentication.getName());
  }
}
