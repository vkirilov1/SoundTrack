package org.soundtrack.api.album.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.repository.AlbumRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlbumService {

  private final AlbumRepository albumRepository;
  private final AlbumMapper albumMapper;

  @Transactional(readOnly = true)
  public AlbumResponse getAlbumById(Long id) {

    Album album =
        albumRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
    return albumMapper.toResponse(album);
  }
}
