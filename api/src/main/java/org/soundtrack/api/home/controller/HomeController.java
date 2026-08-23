package org.soundtrack.api.home.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.home.dto.HomeFeedResponse;
import org.soundtrack.api.home.service.HomeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Home", description = "The logged-in home feed")
public class HomeController {

  private final HomeService homeService;

  @Operation(
      summary = "Personalized home feed",
      description =
          "A recent review from someone the caller follows, chat rooms about albums they've"
              + " engaged with, and a top pick from their favorite genre - each section is null"
              + " or empty when there's nothing to show.")
  @GetMapping("/feed")
  public HomeFeedResponse getFeed() {
    return homeService.getFeed();
  }
}
