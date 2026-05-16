package org.soundtrack.api.artist.controller;

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
public class ArtistController {

  private final ArtistService artistService;

  @GetMapping("/{id}")
  public ArtistResponse getArtist(@PathVariable("id") Long id) {
    return artistService.getArtistById(id);
  }
}
