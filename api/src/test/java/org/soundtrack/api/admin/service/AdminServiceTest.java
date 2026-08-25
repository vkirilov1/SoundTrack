package org.soundtrack.api.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.admin.dto.AddArtistRequest;
import org.soundtrack.api.admin.dto.AddGenreRequest;
import org.soundtrack.api.admin.dto.AddSongArtistRequest;
import org.soundtrack.api.admin.dto.AddSongToAlbumRequest;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.admin.dto.CreateArtistRequest;
import org.soundtrack.api.admin.dto.CreateSongRequest;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.admin.dto.UpdateSongRequest;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.editrequest.service.EditRequestService;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumArtist;
import org.soundtrack.domain.model.AlbumGenre;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.Song;
import org.soundtrack.domain.model.TopicType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;
import org.soundtrack.domain.repository.GenreRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.SongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private ArtistRepository artistRepository;
  @Mock private ReviewRepository reviewRepository;
  @Mock private GenreRepository genreRepository;
  @Mock private SongRepository songRepository;
  @Mock private ChatRoomRepository chatRoomRepository;
  @Mock private AlbumMapper albumMapper;
  @Mock private ArtistMapper artistMapper;
  @Mock private ImageStorageService imageStorageService;
  @Mock private EditRequestService editRequestService;
  @Mock private UserService userService;
  @Mock private NotificationService notificationService;
  @Mock private ChatService chatService;

  private AdminService adminService;
  private final User admin =
      User.builder().id(1L).username("admin").email("admin@example.com").build();

  @BeforeEach
  void setUp() {
    adminService =
        new AdminService(
            userRepository,
            albumRepository,
            artistRepository,
            reviewRepository,
            genreRepository,
            songRepository,
            chatRoomRepository,
            albumMapper,
            artistMapper,
            imageStorageService,
            editRequestService,
            userService,
            notificationService,
            chatService);
    ReflectionTestUtils.setField(adminService, "coverStoragePath", "/covers");
    ReflectionTestUtils.setField(adminService, "artistPhotoStoragePath", "/photos");
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  private void authenticateAsAdmin() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken("admin@example.com", null, List.of()));
    when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
  }

  private Album album(long id) {
    Album album = new Album();
    album.setId(id);
    return album;
  }

  private Genre genre(long id, String name) {
    Genre genre = new Genre();
    genre.setId(id);
    genre.setGenre(name);
    return genre;
  }

  private Artist artist(long id, String name) {
    Artist artist = new Artist();
    artist.setId(id);
    artist.setArtistName(name);
    return artist;
  }

  @Test
  void resetUserPhotoRequiresAnExistingUser() {
    when(userRepository.findById(2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> adminService.resetUserPhoto(2L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void resetUserPhotoNotifiesTheTargetFromTheAuthenticatedAdmin() throws IOException {
    User target = User.builder().id(2L).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(userService.resetPhotoById(2L))
        .thenReturn(new UserProfileResponse(2L, "u", null, null, null, null, false, false, false));
    authenticateAsAdmin();

    adminService.resetUserPhoto(2L);

    verify(notificationService).notify(target, admin, NotificationType.PHOTO_RESET, null, null);
  }

  @Test
  void updateAlbumRequiresAnExistingAlbum() {
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.empty());
    UpdateAlbumRequest request = new UpdateAlbumRequest();
    request.setTitle("t");

    assertThatThrownBy(() -> adminService.updateAlbum(1L, request))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void updateAlbumOnlyChangesProvidedFields() {
    Album album = album(1L);
    album.setReleaseDate(LocalDate.of(2000, 1, 1));
    album.setDescription("original");
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    UpdateAlbumRequest request = new UpdateAlbumRequest();
    request.setTitle("New Title");

    adminService.updateAlbum(1L, request);

    assertThat(album.getTitle()).isEqualTo("New Title");
    assertThat(album.getReleaseDate()).isEqualTo(LocalDate.of(2000, 1, 1));
    assertThat(album.getDescription()).isEqualTo("original");
  }

  @Test
  void searchGenresReturnsEmptyForABlankQuery() {
    List<String> results = adminService.searchGenres("  ");

    assertThat(results).isEmpty();
  }

  @Test
  void searchGenresMapsMatchesToNames() {
    when(genreRepository.findTop8ByGenreContainingIgnoreCase("ro"))
        .thenReturn(List.of(genre(1L, "rock")));

    assertThat(adminService.searchGenres("ro")).containsExactly("rock");
  }

  @Test
  void addGenreToAlbumRejectsADuplicateGenre() {
    Album album = album(1L);
    album
        .getAlbumGenres()
        .add(AlbumGenre.builder().id(1L).genre(genre(1L, "rock")).weight(1).build());
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    AddGenreRequest request = new AddGenreRequest();
    request.setGenre("Rock");

    assertThatThrownBy(() -> adminService.addGenreToAlbum(1L, request))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void addGenreToAlbumUsesAWeightAboveTheCurrentMax() {
    Album album = album(1L);
    album
        .getAlbumGenres()
        .add(AlbumGenre.builder().id(1L).genre(genre(1L, "rock")).weight(5).build());
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(genreRepository.findByGenreIgnoreCase("pop")).thenReturn(Optional.of(genre(2L, "pop")));
    AddGenreRequest request = new AddGenreRequest();
    request.setGenre("pop");

    adminService.addGenreToAlbum(1L, request);

    AlbumGenre added =
        album.getAlbumGenres().stream()
            .filter(g -> g.getGenre().getGenre().equals("pop"))
            .findFirst()
            .orElseThrow();
    assertThat(added.getWeight()).isEqualTo(6);
  }

  @Test
  void addGenreToAlbumCreatesTheGenreWhenItDoesNotExist() {
    Album album = album(1L);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    when(genreRepository.findByGenreIgnoreCase("NewGenre")).thenReturn(Optional.empty());
    when(genreRepository.save(any(Genre.class))).thenAnswer(inv -> inv.getArgument(0));
    AddGenreRequest request = new AddGenreRequest();
    request.setGenre("NewGenre");

    adminService.addGenreToAlbum(1L, request);

    verify(genreRepository).save(any(Genre.class));
  }

  @Test
  void removeGenreFromAlbumRequiresTheGenreToBePresent() {
    Album album = album(1L);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));

    assertThatThrownBy(() -> adminService.removeGenreFromAlbum(1L, "rock"))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeGenreFromAlbumRemovesItCaseInsensitively() {
    Album album = album(1L);
    album
        .getAlbumGenres()
        .add(AlbumGenre.builder().id(1L).genre(genre(1L, "rock")).weight(1).build());
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));

    adminService.removeGenreFromAlbum(1L, "ROCK");

    assertThat(album.getAlbumGenres()).isEmpty();
  }

  @Test
  void searchArtistsReturnsEmptyForABlankQuery() {
    assertThat(adminService.searchArtists(null)).isEmpty();
  }

  @Test
  void searchArtistsMapsMatches() {
    when(artistRepository.findTop8ByArtistNameContainingIgnoreCase("rad"))
        .thenReturn(List.of(artist(1L, "Radiohead")));

    assertThat(adminService.searchArtists("rad")).extracting("name").containsExactly("Radiohead");
  }

  @Test
  void addArtistToAlbumRejectsAnAlreadyCreditedArtist() {
    Album album = album(1L);
    Artist existing = artist(2L, "Existing");
    AlbumArtist link = new AlbumArtist();
    link.setArtist(existing);
    link.setAlbum(album);
    album.getAlbumArtists().add(link);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    AddArtistRequest request = new AddArtistRequest();
    request.setArtistId(2L);

    assertThatThrownBy(() -> adminService.addArtistToAlbum(1L, request))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void addArtistToAlbumUsesTheNextCreditPosition() {
    Album album = album(1L);
    Artist existing = artist(2L, "Existing");
    album.addArtist(existing, 0);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    Artist newArtist = artist(3L, "New");
    when(artistRepository.findById(3L)).thenReturn(Optional.of(newArtist));
    AddArtistRequest request = new AddArtistRequest();
    request.setArtistId(3L);

    adminService.addArtistToAlbum(1L, request);

    assertThat(album.getArtists()).extracting("id").containsExactly(2L, 3L);
  }

  @Test
  void removeArtistFromAlbumRequiresMoreThanOneArtist() {
    Album album = album(1L);
    album.addArtist(artist(2L, "Only"), 0);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));

    assertThatThrownBy(() -> adminService.removeArtistFromAlbum(1L, 2L))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void removeArtistFromAlbumRequiresTheArtistToBeCredited() {
    Album album = album(1L);
    album.addArtist(artist(2L, "One"), 0);
    album.addArtist(artist(3L, "Two"), 1);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));

    assertThatThrownBy(() -> adminService.removeArtistFromAlbum(1L, 99L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void addSongToAlbumCreditsAllCurrentAlbumArtistsInOrder() {
    Album album = album(1L);
    album.addArtist(artist(2L, "One"), 0);
    album.addArtist(artist(3L, "Two"), 1);
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    AddSongToAlbumRequest request = new AddSongToAlbumRequest();
    request.setTitle("Song");
    request.setPosition((short) 1);
    request.setDurationSeconds(120);

    adminService.addSongToAlbum(1L, request);

    org.mockito.ArgumentCaptor<Song> captor = org.mockito.ArgumentCaptor.forClass(Song.class);
    verify(songRepository).save(captor.capture());
    assertThat(captor.getValue().getArtists()).extracting("id").containsExactly(2L, 3L);
  }

  @Test
  void updateSongRequiresAnExistingSong() {
    when(songRepository.findById(1L)).thenReturn(Optional.empty());
    UpdateSongRequest request = new UpdateSongRequest();

    assertThatThrownBy(() -> adminService.updateSong(1L, request))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void updateSongOnlyChangesProvidedFields() {
    Song song = new Song();
    song.setId(1L);
    song.setTitle("Old");
    song.setPosition((short) 1);
    when(songRepository.findById(1L)).thenReturn(Optional.of(song));
    UpdateSongRequest request = new UpdateSongRequest();
    request.setTitle("New");

    adminService.updateSong(1L, request);

    assertThat(song.getTitle()).isEqualTo("New");
    assertThat(song.getPosition()).isEqualTo((short) 1);
  }

  @Test
  void deleteSongRequiresAnExistingSong() {
    when(songRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> adminService.deleteSong(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void addArtistToSongRejectsAnAlreadyCreditedArtist() {
    Song song = new Song();
    song.setId(1L);
    Artist existing = artist(2L, "Existing");
    song.addArtist(existing, 0);
    when(songRepository.findById(1L)).thenReturn(Optional.of(song));
    AddSongArtistRequest request = new AddSongArtistRequest();
    request.setArtistId(2L);

    assertThatThrownBy(() -> adminService.addArtistToSong(1L, request))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void removeArtistFromSongRequiresMoreThanOneArtist() {
    Song song = new Song();
    song.setId(1L);
    song.addArtist(artist(2L, "Only"), 0);
    when(songRepository.findById(1L)).thenReturn(Optional.of(song));

    assertThatThrownBy(() -> adminService.removeArtistFromSong(1L, 2L))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void createAlbumRequiresEveryArtistToExist() {
    CreateAlbumRequest request = new CreateAlbumRequest();
    request.setArtistIds(List.of(1L));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of());

    assertThatThrownBy(() -> adminService.createAlbum(request))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void createAlbumSkipsBlankAndDuplicateGenres() {
    CreateAlbumRequest request = new CreateAlbumRequest();
    request.setTitle("Title");
    request.setReleaseDate(LocalDate.now());
    request.setArtistIds(List.of(1L));
    request.setGenres(List.of("rock", "  ", "ROCK"));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist(1L, "Artist")));
    when(genreRepository.findByGenreIgnoreCase("rock")).thenReturn(Optional.of(genre(1L, "rock")));

    org.mockito.ArgumentCaptor<Album> captor = org.mockito.ArgumentCaptor.forClass(Album.class);
    adminService.createAlbum(request);

    verify(albumRepository).save(captor.capture());
    assertThat(captor.getValue().getAlbumGenres()).hasSize(1);
  }

  @Test
  void createAlbumRequiresEverySongArtistToExist() {
    CreateAlbumRequest request = new CreateAlbumRequest();
    request.setTitle("Title");
    request.setReleaseDate(LocalDate.now());
    request.setArtistIds(List.of(1L));
    CreateSongRequest songRequest = new CreateSongRequest();
    songRequest.setTitle("Song");
    songRequest.setDurationSeconds(100);
    songRequest.setArtistIds(List.of(2L));
    request.setSongs(List.of(songRequest));
    when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist(1L, "Artist")));
    when(artistRepository.findAllById(List.of(2L))).thenReturn(List.of());

    assertThatThrownBy(() -> adminService.createAlbum(request))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void uploadAlbumPhotoRequiresAnExistingAlbum() {
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.empty());
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});

    assertThatThrownBy(() -> adminService.uploadAlbumPhoto(1L, file))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void uploadAlbumPhotoDeletesThePreviousCover() throws IOException {
    Album album = album(1L);
    album.setCoverUrl("old.jpg");
    when(albumRepository.findDetailedById(1L)).thenReturn(Optional.of(album));
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});
    when(imageStorageService.store(file, "/covers", "album-1")).thenReturn("new.jpg");

    adminService.uploadAlbumPhoto(1L, file);

    verify(imageStorageService).deleteIfPresent("old.jpg", "/covers");
    assertThat(album.getCoverUrl()).isEqualTo("new.jpg");
  }

  @Test
  void deleteAlbumRequiresAnExistingAlbum() {
    when(albumRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> adminService.deleteAlbum(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void deleteAlbumDeletesItsReviewsCoverAndAlbumTopicRooms() throws IOException {
    Album album = album(1L);
    album.setCoverUrl("cover.jpg");
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
    ChatRoom room = ChatRoom.builder().id(5L).build();
    when(chatRoomRepository.findByTopicTypeAndTopicId(TopicType.ALBUM, 1L))
        .thenReturn(List.of(room));

    adminService.deleteAlbum(1L);

    verify(chatService).adminDeleteRoom(5L);
    verify(reviewRepository).deleteAllByAlbumId(1L);
    verify(imageStorageService).deleteIfPresent("cover.jpg", "/covers");
    verify(albumRepository).delete(album);
  }

  @Test
  void deleteAlbumSkipsCoverCleanupWhenAlbumHasNoCover() throws IOException {
    Album album = album(1L);
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
    when(chatRoomRepository.findByTopicTypeAndTopicId(TopicType.ALBUM, 1L)).thenReturn(List.of());

    adminService.deleteAlbum(1L);

    verify(imageStorageService, never()).deleteIfPresent(any(), any());
    verify(albumRepository).delete(album);
  }

  @Test
  void createArtistSavesAndMapsTheNewArtist() {
    CreateArtistRequest request = new CreateArtistRequest();
    request.setName("New Artist");
    request.setCountry("US");
    request.setType("Solo");
    when(artistMapper.toResponse(any(Artist.class), eqEmptySet()))
        .thenReturn(new ArtistResponse(null, "New Artist", "US", "Solo", null, null, List.of()));

    ArtistResponse response = adminService.createArtist(request);

    assertThat(response.name()).isEqualTo("New Artist");
    verify(artistRepository).save(any(Artist.class));
  }

  @Test
  void updateArtistRequiresAnExistingArtist() {
    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.empty());
    UpdateArtistRequest request = new UpdateArtistRequest();

    assertThatThrownBy(() -> adminService.updateArtist(1L, request))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void uploadArtistPhotoDoesNotDeleteTheDefaultPhoto() throws IOException {
    Artist artist = artist(1L, "Artist");
    artist.setArtistPic("defaultArtistPhoto.jpg");
    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.of(artist));
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});
    when(imageStorageService.store(file, "/photos", "artist-1")).thenReturn("new.jpg");

    adminService.uploadArtistPhoto(1L, file);

    verify(imageStorageService, never()).deleteIfPresent(any(), any());
  }

  @Test
  void uploadArtistPhotoDeletesACustomPhoto() throws IOException {
    Artist artist = artist(1L, "Artist");
    artist.setArtistPic("custom.jpg");
    when(artistRepository.findDetailedById(1L)).thenReturn(Optional.of(artist));
    MultipartFile file = new MockMultipartFile("file", new byte[] {1});
    when(imageStorageService.store(file, "/photos", "artist-1")).thenReturn("new.jpg");

    adminService.uploadArtistPhoto(1L, file);

    verify(imageStorageService).deleteIfPresent("custom.jpg", "/photos");
  }

  @Test
  void deleteReviewRequiresAnExistingReview() {
    when(reviewRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> adminService.deleteReview(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void deleteReviewResetsRatingWhenItWasTheOnlyReview() {
    Album album = album(1L);
    album.setTitle("Album");
    album.setRating(4.0);
    album.setReviewsCount(1);
    User author = User.builder().id(3L).build();
    Review review = Review.builder().id(1L).album(album).user(author).rating(4.0).build();
    when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
    when(albumRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(album));
    authenticateAsAdmin();

    adminService.deleteReview(1L);

    assertThat(album.getRating()).isEqualTo(0);
    assertThat(album.getReviewsCount()).isEqualTo(0);
    verify(notificationService).notify(author, admin, NotificationType.REVIEW_DELETED, 1L, "Album");
  }

  @Test
  void getEditRequestsDelegatesToEditRequestService() {
    adminService.getEditRequests(0, 20);

    verify(editRequestService).getAllRequests(0, 20);
  }

  @Test
  void approveEditRequestDelegatesToEditRequestService() {
    adminService.approveEditRequest(1L, "admin@example.com");

    verify(editRequestService).approve(1L, "admin@example.com");
  }

  @Test
  void rejectEditRequestDelegatesToEditRequestService() {
    adminService.rejectEditRequest(1L, "admin@example.com");

    verify(editRequestService).reject(1L, "admin@example.com");
  }

  private Set<Long> eqEmptySet() {
    return org.mockito.ArgumentMatchers.eq(Set.of());
  }
}
