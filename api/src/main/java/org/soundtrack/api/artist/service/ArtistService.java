package org.soundtrack.api.artist.service;

import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArtistService {
  private final ArtistRepository artistRepository;
  private final ArtistMapper artistMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public ArtistResponse getArtistById(Long id) {
    Artist artist =
        artistRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));

    Long userId = getAuthenticatedUserIdOrNull();

    Set<Long> albumIds = artist.getAlbums().stream().map(Album::getId).collect(Collectors.toSet());

    Set<Long> favoritedAlbumIds =
        userId != null && !albumIds.isEmpty()
            ? favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(userId, albumIds)
            : Set.of();

    return artistMapper.toResponse(artist, favoritedAlbumIds);
  }

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. GET /api/artists/{id}
   * is open to anonymous visitors but returns per-user favorited flags on its albums when a real
   * session is present.
   *
   * @return the current user's id, or null if not authenticated
   */
  private Long getAuthenticatedUserIdOrNull() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getName())) {
      return null;
    }

    return userRepository.findByEmail(authentication.getName()).map(User::getId).orElse(null);
  }
}
