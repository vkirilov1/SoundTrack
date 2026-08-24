package org.soundtrack.api.userlist.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.mapper.ChartMapper;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserList;

@ExtendWith(MockitoExtension.class)
class UserListMapperTest {

  @Mock private ChartMapper chartMapper;

  private UserListMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = new UserListMapper(chartMapper);
  }

  private Album album(long id, String coverUrl) {
    Album album = new Album();
    album.setId(id);
    album.setCoverUrl(coverUrl);
    return album;
  }

  @Test
  void summaryHasNoCoverWhenListIsEmpty() {
    UserList list = UserList.builder().id(1L).name("Favorites").albums(List.of()).build();

    UserListSummaryResponse response = mapper.toSummary(list);

    assertThat(response.getItemCount()).isEqualTo(0);
    assertThat(response.getCoverUrl()).isNull();
    assertThat(response.isContainsAlbum()).isFalse();
  }

  @Test
  void summaryUsesFirstAlbumsCoverAndFlagsContainment() {
    UserList list =
        UserList.builder()
            .id(1L)
            .name("Favorites")
            .albums(List.of(album(1L, "first.jpg"), album(2L, "second.jpg")))
            .build();

    UserListSummaryResponse response = mapper.toSummary(list, Set.of(1L));

    assertThat(response.getItemCount()).isEqualTo(2);
    assertThat(response.getCoverUrl()).isEqualTo("first.jpg");
    assertThat(response.isContainsAlbum()).isTrue();
  }

  @Test
  void detailMapsOwnerAndDelegatesAlbumMappingToChartMapper() {
    User owner = User.builder().id(9L).username("vkirilov").build();
    Album album1 = album(1L, "cover.jpg");
    UserList list =
        UserList.builder().id(1L).name("Favorites").owner(owner).albums(List.of(album1)).build();

    when(chartMapper.toSummary(any(Album.class), anyBoolean()))
        .thenReturn(
            new AlbumSummaryResponse(1L, "t", null, null, 0, 0, List.of(), List.of(), true));

    UserListDetailResponse response = mapper.toDetail(list, Set.of(1L));

    assertThat(response.getOwnerId()).isEqualTo(9L);
    assertThat(response.getOwnerUsername()).isEqualTo("vkirilov");
    assertThat(response.getAlbums()).hasSize(1);
  }
}
