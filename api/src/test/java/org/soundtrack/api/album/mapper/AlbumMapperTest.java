package org.soundtrack.api.album.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.dto.SongResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumGenre;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.Song;

class AlbumMapperTest {

  private final AlbumMapper mapper = new AlbumMapper();

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
  void mapsScalarFieldsFavoritedAndYearRank() {
    Album album = new Album();
    album.setId(1L);
    album.setTitle("OK Computer");
    album.setCoverUrl("cover.jpg");
    album.setDescription("A landmark album.");
    album.setRating(4.7);
    album.setReviewsCount(120);

    AlbumResponse response = mapper.toResponse(album, true, Set.of(), 3);

    assertThat(response.id()).isEqualTo(1L);
    assertThat(response.title()).isEqualTo("OK Computer");
    assertThat(response.coverUrl()).isEqualTo("cover.jpg");
    assertThat(response.description()).isEqualTo("A landmark album.");
    assertThat(response.rating()).isEqualTo(4.7);
    assertThat(response.reviewsCount()).isEqualTo(120);
    assertThat(response.favorited()).isTrue();
    assertThat(response.yearRank()).isEqualTo(3);
  }

  @Test
  void sortsGenresByWeightDescendingThenId() {
    Album album = new Album();
    album.setId(1L);
    album
        .getAlbumGenres()
        .addAll(
            List.of(
                albumGenre(100L, album, genre(1L, "art rock"), 3),
                albumGenre(101L, album, genre(2L, "alternative rock"), 9),
                albumGenre(102L, album, genre(3L, "electronic"), 9)));

    AlbumResponse response = mapper.toResponse(album, false, Set.of(), null);

    assertThat(response.genres()).containsExactly("alternative rock", "electronic", "art rock");
  }

  @Test
  void marksOnlyFavoritedSongsAndPassesThroughDuration() {
    Album album = new Album();
    album.setId(1L);

    Song song1 = new Song();
    song1.setId(10L);
    song1.setPosition((short) 1);
    song1.setTitle("Airbag");
    song1.setDuration(Duration.ofSeconds(284));
    song1.setAlbum(album);
    song1.addArtist(artist(1L, "Radiohead"), 0);

    Song song2 = new Song();
    song2.setId(11L);
    song2.setPosition((short) 2);
    song2.setTitle("Paranoid Android");
    song2.setDuration(Duration.ofSeconds(383));
    song2.setAlbum(album);

    album.setSongs(Set.of(song1, song2));

    AlbumResponse response = mapper.toResponse(album, false, Set.of(10L), null);

    SongResponse mappedSong1 =
        response.songs().stream().filter(s -> s.id().equals(10L)).findFirst().orElseThrow();
    SongResponse mappedSong2 =
        response.songs().stream().filter(s -> s.id().equals(11L)).findFirst().orElseThrow();

    assertThat(mappedSong1.favorited()).isTrue();
    assertThat(mappedSong1.durationSeconds()).isEqualTo(284L);
    assertThat(mappedSong1.artists()).extracting("name").containsExactly("Radiohead");
    assertThat(mappedSong2.favorited()).isFalse();
  }
}
