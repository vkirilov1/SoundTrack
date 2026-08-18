package org.soundtrack.api.userlist.mapper;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.UserList;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserListMapper {

  private final ChartMapper chartMapper;

  public UserListSummaryResponse toSummary(UserList userList) {
    return toSummary(userList, Set.of());
  }

  /**
   * @param listIdsContainingAlbum ids of lists (from the same caller's set of lists) that already
   *     contain a particular album; used to flag {@code containsAlbum} when the caller is choosing
   *     which list to add an album to. Empty when that context isn't relevant.
   */
  public UserListSummaryResponse toSummary(UserList userList, Set<Long> listIdsContainingAlbum) {
    List<Album> albums = userList.getAlbums();

    return UserListSummaryResponse.builder()
        .id(userList.getId())
        .name(userList.getName())
        .description(userList.getDescription())
        .itemCount(albums.size())
        .coverUrl(albums.isEmpty() ? null : albums.get(0).getCoverUrl())
        .containsAlbum(listIdsContainingAlbum.contains(userList.getId()))
        .build();
  }

  /**
   * @param favoritedAlbumIds ids (from this list's albums) the current viewer has favorited, for
   *     each album's {@code favorited} flag - empty for an anonymous viewer.
   */
  public UserListDetailResponse toDetail(UserList userList, Set<Long> favoritedAlbumIds) {
    List<AlbumSummaryResponse> albums =
        userList.getAlbums().stream()
            .map(album -> chartMapper.toSummary(album, favoritedAlbumIds.contains(album.getId())))
            .toList();

    return UserListDetailResponse.builder()
        .id(userList.getId())
        .name(userList.getName())
        .description(userList.getDescription())
        .ownerId(userList.getOwner().getId())
        .ownerUsername(userList.getOwner().getUsername())
        .createdAt(userList.getCreatedAt())
        .albums(albums)
        .build();
  }
}
