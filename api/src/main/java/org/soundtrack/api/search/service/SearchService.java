package org.soundtrack.api.search.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.search.dto.SearchResponse;
import org.soundtrack.api.search.mapper.SearchMapper;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SearchService {

  private static final int MIN_QUERY_LENGTH = 2;
  private static final int MAX_RESULTS = 8;

  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final UserRepository userRepository;
  private final SearchMapper searchMapper;

  @Transactional(readOnly = true)
  public SearchResponse search(String query) {
    if (isTooShort(query)) {
      return new SearchResponse(List.of(), List.of());
    }

    String trimmed = query.trim();

    List<Album> directAlbums = albumRepository.findTop8ByTitleContainingIgnoreCase(trimmed);
    List<Artist> directArtists = artistRepository.findTop8ByArtistNameContainingIgnoreCase(trimmed);

    // Also surface each matched artist's albums, and each matched album's
    // artists, so e.g. searching an artist name pulls in their discography
    // even though the album titles themselves don't contain the query text.
    List<Album> relatedAlbums =
        directArtists.stream().flatMap(artist -> artist.getAlbums().stream()).toList();
    List<Artist> relatedArtists =
        directAlbums.stream().flatMap(album -> album.getArtists().stream()).toList();

    List<Album> albums = mergeById(directAlbums, relatedAlbums, Album::getId);
    List<Artist> artists = mergeById(directArtists, relatedArtists, Artist::getId);

    return new SearchResponse(
        albums.stream().map(searchMapper::toAlbumResult).toList(),
        artists.stream().map(searchMapper::toArtistResult).toList());
  }

  /**
   * Combines two lists into one, de-duplicated by id and capped at {@link #MAX_RESULTS}, preferring
   * entries from {@code primary} (direct matches) over {@code secondary} (related entries pulled in
   * via association) whenever both are present.
   */
  private <T> List<T> mergeById(List<T> primary, List<T> secondary, Function<T, Long> idOf) {
    Map<Long, T> byId = new LinkedHashMap<>();
    primary.forEach(item -> byId.putIfAbsent(idOf.apply(item), item));
    secondary.forEach(item -> byId.putIfAbsent(idOf.apply(item), item));
    return byId.values().stream().limit(MAX_RESULTS).toList();
  }

  @Transactional(readOnly = true)
  public List<UserProfileResponse> searchUsers(String query) {
    if (isTooShort(query)) {
      return List.of();
    }

    List<User> users = userRepository.findTop8ByUsernameContainingIgnoreCase(query.trim());

    return users.stream().map(this::toProfileResponse).toList();
  }

  private boolean isTooShort(String query) {
    return query == null || query.trim().length() < MIN_QUERY_LENGTH;
  }

  private UserProfileResponse toProfileResponse(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getBio(),
        user.getProfilePicture(),
        user.getJoinDate(),
        user.getRole(),
        false,
        false);
  }
}
