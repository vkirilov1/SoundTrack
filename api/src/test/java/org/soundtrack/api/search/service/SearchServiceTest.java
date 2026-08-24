package org.soundtrack.api.search.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.search.dto.SearchResponse;
import org.soundtrack.api.search.dto.SearchResultResponse;
import org.soundtrack.api.search.dto.SearchResultType;
import org.soundtrack.api.search.mapper.SearchMapper;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumArtist;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

  @Mock private AlbumRepository albumRepository;
  @Mock private ArtistRepository artistRepository;
  @Mock private UserRepository userRepository;
  @Mock private SearchMapper searchMapper;

  private SearchService searchService;

  @BeforeEach
  void setUp() {
    searchService =
        new SearchService(albumRepository, artistRepository, userRepository, searchMapper);
  }

  private Artist artist(long id, String name) {
    Artist artist = new Artist();
    artist.setId(id);
    artist.setArtistName(name);
    return artist;
  }

  private Album album(long id, String title) {
    Album album = new Album();
    album.setId(id);
    album.setTitle(title);
    return album;
  }

  private SearchResultResponse albumResult(long id) {
    return SearchResultResponse.builder().id(id).type(SearchResultType.ALBUM).build();
  }

  private SearchResultResponse artistResult(long id) {
    return SearchResultResponse.builder().id(id).type(SearchResultType.ARTIST).build();
  }

  @Test
  void queryShorterThanTwoCharactersReturnsNoResultsWithoutQuerying() {
    SearchResponse response = searchService.search("a");

    assertThat(response.albums()).isEmpty();
    assertThat(response.artists()).isEmpty();
  }

  @Test
  void pullsInAMatchedArtistsAlbumsEvenWhenTitleDoesNotMatch() {
    Artist matchedArtist = artist(1L, "Radiohead");
    Album relatedAlbum = album(10L, "OK Computer");
    matchedArtist.getAlbumCredits().add(link(matchedArtist, relatedAlbum));

    when(albumRepository.findTop8ByTitleContainingIgnoreCase("radio")).thenReturn(List.of());
    when(artistRepository.findTop8ByArtistNameContainingIgnoreCase("radio"))
        .thenReturn(List.of(matchedArtist));
    when(searchMapper.toAlbumResult(relatedAlbum)).thenReturn(albumResult(10L));
    when(searchMapper.toArtistResult(matchedArtist)).thenReturn(artistResult(1L));

    SearchResponse response = searchService.search("radio");

    assertThat(response.albums()).extracting("id").containsExactly(10L);
  }

  @Test
  void directMatchesAreDeduplicatedAndPreferredOverRelatedOnes() {
    Album directAlbum = album(10L, "OK Computer");
    Artist artistOfDirectAlbum = artist(1L, "Radiohead");
    directAlbum.addArtist(artistOfDirectAlbum, 0);

    when(albumRepository.findTop8ByTitleContainingIgnoreCase("ok"))
        .thenReturn(List.of(directAlbum));
    when(artistRepository.findTop8ByArtistNameContainingIgnoreCase("ok")).thenReturn(List.of());
    when(searchMapper.toAlbumResult(directAlbum)).thenReturn(albumResult(10L));
    when(searchMapper.toArtistResult(artistOfDirectAlbum)).thenReturn(artistResult(1L));

    SearchResponse response = searchService.search("ok");

    assertThat(response.albums()).hasSize(1);
    assertThat(response.artists()).hasSize(1);
  }

  @Test
  void searchUsersExcludesAdmins() {
    User regular = User.builder().id(1L).username("regular").role(UserRole.USER).build();
    when(userRepository.findTop8ByUsernameContainingIgnoreCaseAndRoleNot("re", UserRole.ADMIN))
        .thenReturn(List.of(regular));

    List<UserProfileResponse> results = searchService.searchUsers("re");

    assertThat(results).extracting("id").containsExactly(1L);
  }

  @Test
  void searchUsersShorterThanTwoCharactersReturnsEmpty() {
    List<UserProfileResponse> results = searchService.searchUsers(" a ");

    assertThat(results).isEmpty();
  }

  private AlbumArtist link(Artist artist, Album album) {
    AlbumArtist link = new AlbumArtist();
    link.setArtist(artist);
    link.setAlbum(album);
    return link;
  }
}
