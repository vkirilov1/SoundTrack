package org.soundtrack.api.userlist.mapper;

import java.util.List;
import org.soundtrack.api.userlist.dto.AlbumSummaryResponse;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.UserList;
import org.springframework.stereotype.Component;

@Component
public class UserListMapper {

  public UserListSummaryResponse toSummary(UserList userList) {
    List<Album> albums = userList.getAlbums();

    return UserListSummaryResponse.builder()
        .id(userList.getId())
        .name(userList.getName())
        .description(userList.getDescription())
        .itemCount(albums.size())
        .coverUrl(albums.isEmpty() ? null : albums.get(0).getCoverUrl())
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
    List<String> artistNames = album.getArtists().stream().map(Artist::getArtistName).toList();

    return AlbumSummaryResponse.builder()
        .id(album.getId())
        .title(album.getTitle())
        .coverUrl(album.getCoverUrl())
        .releaseDate(album.getReleaseDate())
        .artistNames(artistNames)
        .build();
  }
}
