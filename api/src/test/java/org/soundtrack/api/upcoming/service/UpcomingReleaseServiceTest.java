package org.soundtrack.api.upcoming.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.admin.dto.CreateSongRequest;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.UpcomingRelease;
import org.soundtrack.domain.model.UpcomingReleasePayload;
import org.soundtrack.domain.model.UpcomingReleasePayload.ArtistCredit;
import org.soundtrack.domain.model.UpcomingReleasePayload.SongDraft;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.GenreRepository;
import org.soundtrack.domain.repository.UpcomingReleaseRepository;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class UpcomingReleaseServiceTest {

  @Mock private UpcomingReleaseRepository upcomingReleaseRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private ArtistRepository artistRepository;
  @Mock private GenreRepository genreRepository;
  @Mock private AlbumMapper albumMapper;
  @Mock private ImageStorageService imageStorageService;

  private UpcomingReleaseService service;

  @BeforeEach
  void setUp() {
    service =
        new UpcomingReleaseService(
            upcomingReleaseRepository,
            albumRepository,
            artistRepository,
            genreRepository,
            albumMapper,
            imageStorageService);
    ReflectionTestUtils.setField(service, "coverStoragePath", "/covers");
  }

  private Artist artist(long id, String name) {
    Artist artist = new Artist();
    artist.setId(id);
    artist.setArtistName(name);
    return artist;
  }

  private CreateAlbumRequest createAlbumRequest() {
    CreateAlbumRequest request = new CreateAlbumRequest();
    request.setTitle("New Album");
    request.setReleaseDate(LocalDate.now().plusMonths(1));
    request.setDescription("desc");
    request.setArtistIds(List.of(1L));
    return request;
  }

  @Test
  void createRequiresEveryArtistToExist() {
    CreateAlbumRequest request = createAlbumRequest();
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of());

    assertThatThrownBy(() -> service.create(request)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void createSavesTheReleaseWithArtistCreditsAndGenres() {
    CreateAlbumRequest request = createAlbumRequest();
    request.setGenres(List.of("rock"));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist(1L, "Artist")));
    when(upcomingReleaseRepository.save(any(UpcomingRelease.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    var response = service.create(request);

    assertThat(response.title()).isEqualTo("New Album");
    assertThat(response.artistNames()).containsExactly("Artist");
  }

  @Test
  void uploadCoverPhotoRequiresAnExistingRelease() {
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.empty());
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});

    assertThatThrownBy(() -> service.uploadCoverPhoto(1L, file))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void uploadCoverPhotoDeletesThePreviousCover() throws Exception {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("t")
            .releaseDate(LocalDate.now())
            .coverUrl("old.jpg")
            .payload(new UpcomingReleasePayload(null, List.of(), List.of(), List.of()))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});
    when(imageStorageService.store(file, "/covers", "upcoming-1")).thenReturn("new.jpg");

    service.uploadCoverPhoto(1L, file);

    verify(imageStorageService).deleteIfPresent("old.jpg", "/covers");
    assertThat(release.getCoverUrl()).isEqualTo("new.jpg");
  }

  @Test
  void publishRequiresAnExistingRelease() {
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.publish(1L)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void publishRejectsAReleaseNotYetOut() {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("t")
            .releaseDate(LocalDate.now().plusDays(1))
            .payload(new UpcomingReleasePayload(null, List.of(), List.of(), List.of()))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));

    assertThatThrownBy(() -> service.publish(1L)).isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void publishRequiresEveryCreditedArtistToStillExist() {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("t")
            .releaseDate(LocalDate.now().minusDays(1))
            .payload(
                new UpcomingReleasePayload(
                    null, List.of(new ArtistCredit(1L, "Artist")), List.of(), List.of()))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of());

    assertThatThrownBy(() -> service.publish(1L)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void publishBuildsAnAlbumFromThePayloadAndDeletesTheRelease() {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("New Album")
            .releaseDate(LocalDate.now().minusDays(1))
            .coverUrl("cover.jpg")
            .payload(
                new UpcomingReleasePayload(
                    "desc",
                    List.of(new ArtistCredit(1L, "Artist")),
                    List.of("rock"),
                    List.of(new SongDraft("Song", 120, List.of(new ArtistCredit(1L, "Artist"))))))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist(1L, "Artist")));
    when(genreRepository.findByGenreIgnoreCase("rock")).thenReturn(Optional.empty());
    when(genreRepository.save(any(Genre.class))).thenAnswer(inv -> inv.getArgument(0));
    when(albumRepository.save(any(Album.class))).thenAnswer(inv -> inv.getArgument(0));
    when(albumMapper.toResponse(any(Album.class), eq(false), eq(Set.of()), eq(null)))
        .thenReturn(
            new AlbumResponse(
                1L,
                "New Album",
                "cover.jpg",
                release.getReleaseDate(),
                0,
                0,
                List.of(),
                List.of(),
                List.of(),
                "desc",
                false,
                null));

    ArgumentCaptor<Album> captor = ArgumentCaptor.forClass(Album.class);
    AlbumResponse response = service.publish(1L);

    verify(albumRepository).save(captor.capture());
    assertThat(captor.getValue().getTitle()).isEqualTo("New Album");
    assertThat(captor.getValue().getArtists()).extracting("artistName").containsExactly("Artist");
    assertThat(captor.getValue().getSongs()).hasSize(1);
    assertThat(response.title()).isEqualTo("New Album");
    verify(upcomingReleaseRepository).delete(release);
  }

  @Test
  void deleteRequiresAnExistingRelease() {
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.delete(1L)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void deleteRemovesTheStoredCoverWhenPresent() throws Exception {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("t")
            .releaseDate(LocalDate.now())
            .coverUrl("cover.jpg")
            .payload(new UpcomingReleasePayload(null, List.of(), List.of(), List.of()))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));

    service.delete(1L);

    verify(imageStorageService).deleteIfPresent("cover.jpg", "/covers");
    verify(upcomingReleaseRepository).delete(release);
  }

  @Test
  void deleteSkipsImageCleanupWhenThereIsNoCover() throws Exception {
    UpcomingRelease release =
        UpcomingRelease.builder()
            .id(1L)
            .title("t")
            .releaseDate(LocalDate.now())
            .payload(new UpcomingReleasePayload(null, List.of(), List.of(), List.of()))
            .build();
    when(upcomingReleaseRepository.findById(1L)).thenReturn(Optional.of(release));

    service.delete(1L);

    verify(imageStorageService, never()).deleteIfPresent(any(), any());
  }

  @Test
  void createBuildsSongDraftsFromRequestedSongs() {
    CreateAlbumRequest request = createAlbumRequest();
    CreateSongRequest songRequest = new CreateSongRequest();
    songRequest.setTitle("Song");
    songRequest.setDurationSeconds(120);
    songRequest.setArtistIds(List.of(1L));
    request.setSongs(List.of(songRequest));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist(1L, "Artist")));
    when(upcomingReleaseRepository.save(any(UpcomingRelease.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    service.create(request);

    ArgumentCaptor<UpcomingRelease> captor = ArgumentCaptor.forClass(UpcomingRelease.class);
    verify(upcomingReleaseRepository).save(captor.capture());
    assertThat(captor.getValue().getPayload().songs()).hasSize(1);
    assertThat(captor.getValue().getPayload().songs().get(0).title()).isEqualTo("Song");
  }
}
