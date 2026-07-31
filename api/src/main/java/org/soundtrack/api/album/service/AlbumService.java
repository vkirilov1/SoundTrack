package org.soundtrack.api.album.service;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.FavoriteSongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlbumService {

  private final AlbumRepository albumRepository;
  private final AlbumMapper albumMapper;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final FavoriteSongRepository favoriteSongRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public AlbumResponse getAlbumById(Long id) {

    Album album =
        albumRepository
            .findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Album not found"));

    Long userId = getAuthenticatedUserIdOrNull();

    boolean favorited =
        userId != null && favoriteAlbumRepository.existsByUserIdAndAlbumId(userId, id);

    Set<Long> favoritedSongIds =
        userId != null
            ? favoriteSongRepository.findFavoritedSongIdsByUserIdAndAlbumId(userId, id)
            : Set.of();

    return albumMapper.toResponse(album, favorited, favoritedSongIds);
  }

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. GET /api/albums/{id}
   * is open to anonymous visitors but returns per-user favorited flags when a real session is
   * present.
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
