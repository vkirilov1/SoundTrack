package org.soundtrack.api.artist.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumArtist;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;

@ExtendWith(MockitoExtension.class)
class ArtistServiceTest {

  @Mock private ArtistRepository artistRepository;
  @Mock private ArtistMapper artistMapper;
  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private CurrentUserService currentUserService;

  private ArtistService artistService;

  @BeforeEach
  void setUp() {
    artistService =
        new ArtistService(
            artistRepository, artistMapper, favoriteAlbumRepository, currentUserService);
  }

  @Test
  void throwsWhenArtistNotFound() {
    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> artistService.getArtistById(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void skipsFavoritesLookupWhenArtistHasNoAlbums() {
    Artist artist = new Artist();
    artist.setId(1L);
    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.of(artist));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(9L);

    artistService.getArtistById(1L);

    verify(artistMapper).toResponse(artist, Set.of());
    verify(favoriteAlbumRepository, never())
        .findFavoritedAlbumIdsByUserIdAndAlbumIdIn(any(), any());
  }

  @Test
  void skipsFavoritesLookupForAnonymousCaller() {
    Artist artist = new Artist();
    artist.setId(1L);
    Album album = new Album();
    album.setId(5L);
    AlbumArtist link = new AlbumArtist();
    link.setArtist(artist);
    link.setAlbum(album);
    artist.getAlbumCredits().add(link);

    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.of(artist));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    artistService.getArtistById(1L);

    verify(artistMapper).toResponse(artist, Set.of());
    verify(favoriteAlbumRepository, never())
        .findFavoritedAlbumIdsByUserIdAndAlbumIdIn(any(), any());
  }

  @Test
  void looksUpFavoritedAlbumsForAuthenticatedCallerWithAlbums() {
    Artist artist = new Artist();
    artist.setId(1L);
    Album album = new Album();
    album.setId(5L);
    AlbumArtist link = new AlbumArtist();
    link.setArtist(artist);
    link.setAlbum(album);
    artist.getAlbumCredits().add(link);

    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.of(artist));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(9L);
    when(favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(9L, Set.of(5L)))
        .thenReturn(Set.of(5L));

    artistService.getArtistById(1L);

    verify(artistMapper).toResponse(artist, Set.of(5L));
  }
}
