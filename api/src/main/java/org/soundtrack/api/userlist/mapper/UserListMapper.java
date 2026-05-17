package org.soundtrack.api.userlist.mapper;

import java.util.List;
import org.soundtrack.api.userlist.dto.AlbumSummaryResponse;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.UserList;
import org.springframework.stereotype.Component;

@Component
public class UserListMapper {

  public UserListSummaryResponse toSummary(UserList userList) {
    return UserListSummaryResponse.builder()
        .id(userList.getId())
        .name(userList.getName())
        .description(userList.getDescription())
        .build();
  }

  public UserListDetailResponse toDetail(UserList userList) {
    List<AlbumSummaryResponse> albums =
        userList.getAlbums().stream().map(this::toAlbumSummary).toList();

    return UserListDetailResponse.builder()
        .id(userList.getId())
        .name(userList.getName())
        .description(userList.getDescription())
        .ownerUsername(userList.getOwner().getUsername())
        .albums(albums)
        .build();
  }

  private AlbumSummaryResponse toAlbumSummary(Album album) {
    List<String> artistNames = album.getArtists().stream().map(a -> a.getArtistName()).toList();

    return AlbumSummaryResponse.builder()
        .id(album.getId())
        .title(album.getTitle())
        .coverUrl(album.getCoverUrl())
        .releaseDate(album.getReleaseDate())
        .artistNames(artistNames)
        .build();
  }
}
