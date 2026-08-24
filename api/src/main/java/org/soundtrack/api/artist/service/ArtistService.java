package org.soundtrack.api.artist.service;

import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArtistService {
  private final ArtistRepository artistRepository;
  private final ArtistMapper artistMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public ArtistResponse getArtistById(Long id) {
    Artist artist =
        artistRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));

    Long userId = currentUserService.getAuthenticatedUserIdOrNull();

    Set<Long> albumIds = artist.getAlbums().stream().map(Album::getId).collect(Collectors.toSet());

    Set<Long> favoritedAlbumIds =
        userId != null && !albumIds.isEmpty()
            ? favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(userId, albumIds)
            : Set.of();

    return artistMapper.toResponse(artist, favoritedAlbumIds);
  }
}
