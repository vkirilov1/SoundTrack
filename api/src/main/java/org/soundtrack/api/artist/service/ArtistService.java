package org.soundtrack.api.artist.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.repository.ArtistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArtistService {
  private final ArtistRepository artistRepository;
  private final ArtistMapper artistMapper;

  @Transactional(readOnly = true)
  public ArtistResponse getArtistById(Long id) {
    Artist artist =
        artistRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
    return artistMapper.toResponse(artist);
  }
}
