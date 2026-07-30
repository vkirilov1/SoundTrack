package org.soundtrack.api.search.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.search.dto.SearchResponse;
import org.soundtrack.api.search.service.SearchService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Search for albums, artists, and users")
public class SearchController {

  private final SearchService searchService;

  @GetMapping
  @Operation(
      summary = "Search albums and artists",
      description =
          "Returns up to 8 matching albums and up to 8 matching artists for the given query."
              + " Queries shorter than 2 characters return empty results.")
  @ApiResponses({@ApiResponse(responseCode = "200", description = "Results returned")})
  public SearchResponse search(
      @Parameter(description = "Search text") @RequestParam(name = "q", defaultValue = "")
          String query) {
    return searchService.search(query);
  }

  @GetMapping("/users")
  @Operation(
      summary = "Search users",
      description = "Returns up to 8 matching users by username for the given query.")
  @ApiResponses({@ApiResponse(responseCode = "200", description = "Results returned")})
  public List<UserProfileResponse> searchUsers(
      @Parameter(description = "Search text") @RequestParam(name = "q", defaultValue = "")
          String query) {
    return searchService.searchUsers(query);
  }
}
