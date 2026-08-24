package org.soundtrack.api.search.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.soundtrack.api.search.dto.SearchResultResponse;
import org.soundtrack.api.search.dto.SearchResultType;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;

class SearchMapperTest {

  private final SearchMapper mapper = new SearchMapper();

  private Artist artist(long id, String name) {
    Artist artist = new Artist();
    artist.setId(id);
    artist.setArtistName(name);
    return artist;
  }

  @Test
  void joinsMultipleArtistCreditsIntoOneSubtitle() {
    Album album = new Album();
    album.setId(1L);
    album.setTitle("Watch the Throne");
    album.setCoverUrl("cover.jpg");
    album.addArtist(artist(1L, "Jay-Z"), 0);
    album.addArtist(artist(2L, "Kanye West"), 1);

    SearchResultResponse response = mapper.toAlbumResult(album);

    assertThat(response.getType()).isEqualTo(SearchResultType.ALBUM);
    assertThat(response.getTitle()).isEqualTo("Watch the Throne");
    assertThat(response.getSubtitle()).isEqualTo("Jay-Z, Kanye West");
    assertThat(response.getImageUrl()).isEqualTo("cover.jpg");
  }

  @Test
  void mapsArtistResultWithCountryAsSubtitle() {
    Artist artist = artist(1L, "Radiohead");
    artist.setCountry("United Kingdom");
    artist.setArtistPic("radiohead.jpg");

    SearchResultResponse response = mapper.toArtistResult(artist);

    assertThat(response.getType()).isEqualTo(SearchResultType.ARTIST);
    assertThat(response.getTitle()).isEqualTo("Radiohead");
    assertThat(response.getSubtitle()).isEqualTo("United Kingdom");
    assertThat(response.getImageUrl()).isEqualTo("radiohead.jpg");
  }
}
