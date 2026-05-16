package org.soundtrack.api.album.controller;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.service.AlbumService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
public class AlbumController {

  private final AlbumService albumService;

  @GetMapping("/{id}")
  public AlbumResponse getAlbum(@PathVariable("id") Long id) {
    return albumService.getAlbumById(id);
  }
}
