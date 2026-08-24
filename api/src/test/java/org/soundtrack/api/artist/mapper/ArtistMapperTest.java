package org.soundtrack.api.artist.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumArtist;
import org.soundtrack.domain.model.Artist;

class ArtistMapperTest {

  private final ArtistMapper mapper = new ArtistMapper();

  private Album album(long id, String title, LocalDate releaseDate) {
    Album album = new Album();
    album.setId(id);
    album.setTitle(title);
    album.setReleaseDate(releaseDate);
    return album;
  }

  private void credit(Artist artist, Album album) {
    AlbumArtist link = new AlbumArtist();
    link.setArtist(artist);
    link.setAlbum(album);
    artist.getAlbumCredits().add(link);
  }

  @Test
  void mapsScalarFields() {
    Artist artist = new Artist();
    artist.setId(1L);
    artist.setArtistName("Radiohead");
    artist.setCountry("UK");
    artist.setArtistType("Group");
    artist.setBiography("An English rock band.");
    artist.setArtistPic("radiohead.jpg");

    ArtistResponse response = mapper.toResponse(artist, Set.of());

    assertThat(response.id()).isEqualTo(1L);
    assertThat(response.name()).isEqualTo("Radiohead");
    assertThat(response.country()).isEqualTo("UK");
    assertThat(response.type()).isEqualTo("Group");
    assertThat(response.biography()).isEqualTo("An English rock band.");
    assertThat(response.artistPic()).isEqualTo("radiohead.jpg");
  }

  @Test
  void sortsAlbumsByReleaseDateDescendingThenTitleForTies() {
    Artist artist = new Artist();
    artist.setId(1L);

    Album older = album(1L, "Pablo Honey", LocalDate.of(1993, 2, 22));
    Album newerB = album(2L, "The Bends", LocalDate.of(1995, 3, 13));
    Album newerA = album(3L, "amnesiac", LocalDate.of(1995, 3, 13));

    credit(artist, older);
    credit(artist, newerB);
    credit(artist, newerA);

    ArtistResponse response = mapper.toResponse(artist, Set.of());

    assertThat(response.albums())
        .extracting("title")
        .containsExactly("amnesiac", "The Bends", "Pablo Honey");
  }

  @Test
  void marksOnlyFavoritedAlbums() {
    Artist artist = new Artist();
    artist.setId(1L);
    Album favorited = album(1L, "Kid A", LocalDate.of(2000, 10, 2));
    Album notFavorited = album(2L, "Amnesiac", LocalDate.of(2001, 6, 5));
    credit(artist, favorited);
    credit(artist, notFavorited);

    ArtistResponse response = mapper.toResponse(artist, Set.of(1L));

    assertThat(response.albums())
        .filteredOn(a -> a.id().equals(1L))
        .extracting("favorited")
        .containsExactly(true);
    assertThat(response.albums())
        .filteredOn(a -> a.id().equals(2L))
        .extracting("favorited")
        .containsExactly(false);
  }
}
