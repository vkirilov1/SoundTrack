package org.soundtrack.api.chart.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumGenre;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;

class ChartMapperTest {

  private final ChartMapper mapper = new ChartMapper();

  private Artist artist(long id, String name) {
    Artist artist = new Artist();
    artist.setId(id);
    artist.setArtistName(name);
    return artist;
  }

  private Genre genre(long id, String name) {
    Genre genre = new Genre();
    genre.setId(id);
    genre.setGenre(name);
    return genre;
  }

  private AlbumGenre albumGenre(long id, Album album, Genre genre, int weight) {
    return AlbumGenre.builder().id(id).album(album).genre(genre).weight(weight).build();
  }

  @Test
  void mapsScalarFieldsAndFavoritedFlag() {
    Album album = new Album();
    album.setId(1L);
    album.setTitle("In the Court of the Crimson King");
    album.setCoverUrl("cover.jpg");
    album.setReleaseDate(LocalDate.of(1969, 10, 10));
    album.setRating(4.2);
    album.setReviewsCount(54);

    AlbumSummaryResponse response = mapper.toSummary(album, true);

    assertThat(response.id()).isEqualTo(1L);
    assertThat(response.title()).isEqualTo("In the Court of the Crimson King");
    assertThat(response.coverUrl()).isEqualTo("cover.jpg");
    assertThat(response.releaseDate()).isEqualTo(LocalDate.of(1969, 10, 10));
    assertThat(response.rating()).isEqualTo(4.2);
    assertThat(response.reviewsCount()).isEqualTo(54);
    assertThat(response.favorited()).isTrue();
  }

  @Test
  void ordersArtistsByCreditPosition() {
    Album album = new Album();
    album.setId(1L);
    album.addArtist(artist(2L, "Second Artist"), 1);
    album.addArtist(artist(1L, "First Artist"), 0);

    AlbumSummaryResponse response = mapper.toSummary(album, false);

    assertThat(response.artists())
        .extracting("name")
        .containsExactly("First Artist", "Second Artist");
  }

  @Test
  void capsGenresAtThreeSortedByWeightDescendingThenId() {
    Album album = new Album();
    album.setId(1L);
    album
        .getAlbumGenres()
        .addAll(
            List.of(
                albumGenre(100L, album, genre(10L, "progressive rock"), 5),
                albumGenre(101L, album, genre(11L, "art rock"), 8),
                albumGenre(102L, album, genre(12L, "rock"), 8),
                albumGenre(103L, album, genre(13L, "symphonic rock"), 1)));

    AlbumSummaryResponse response = mapper.toSummary(album, false);

    assertThat(response.genres()).containsExactly("art rock", "rock", "progressive rock");
  }
}
