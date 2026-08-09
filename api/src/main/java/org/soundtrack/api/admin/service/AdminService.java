package org.soundtrack.api.admin.service;

import java.io.IOException;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.AddArtistRequest;
import org.soundtrack.api.admin.dto.AddGenreRequest;
import org.soundtrack.api.admin.dto.AddSongArtistRequest;
import org.soundtrack.api.admin.dto.AddSongToAlbumRequest;
import org.soundtrack.api.admin.dto.AdminUserResponse;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.admin.dto.CreateArtistRequest;
import org.soundtrack.api.admin.dto.CreateSongRequest;
import org.soundtrack.api.admin.dto.UpdateAlbumRequest;
import org.soundtrack.api.admin.dto.UpdateArtistRequest;
import org.soundtrack.api.admin.dto.UpdateSongRequest;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.dto.SongResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.artist.dto.ArtistResponse;
import org.soundtrack.api.artist.mapper.ArtistMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.editrequest.dto.EditRequestResponse;
import org.soundtrack.api.editrequest.service.EditRequestService;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.AlbumArtist;
import org.soundtrack.domain.model.AlbumGenre;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.Song;
import org.soundtrack.domain.model.SongArtist;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.GenreRepository;
import org.soundtrack.domain.repository.ReviewRepository;
import org.soundtrack.domain.repository.SongRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdminService {

  private static final String DEFAULT_ARTIST_PHOTO = "defaultArtistPhoto.jpg";

  private final UserRepository userRepository;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final ReviewRepository reviewRepository;
  private final GenreRepository genreRepository;
  private final SongRepository songRepository;
  private final AlbumMapper albumMapper;
  private final ArtistMapper artistMapper;
  private final ImageStorageService imageStorageService;
  private final EditRequestService editRequestService;
  private final UserService userService;
  private final NotificationService notificationService;

  @Value("${cover.storage.path}")
  private String coverStoragePath;

  @Value("${artist.photo.storage.path}")
  private String artistPhotoStoragePath;

  @Transactional(readOnly = true)
  public PagedResponse<AdminUserResponse> getUsers(int page, int size) {
    Page<User> userPage =
        userRepository.findAll(PageRequest.of(page, size, Sort.by("id").ascending()));

    List<AdminUserResponse> content =
        userPage.getContent().stream().map(this::toAdminUserResponse).toList();

    return new PagedResponse<>(
        content, page, size, userPage.getTotalElements(), userPage.getTotalPages());
  }

  @Transactional
  public void deleteUser(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

    List<Review> reviews = reviewRepository.findByUserId(userId);
    for (Review review : reviews) {
      Album album = findAlbumForUpdate(review.getAlbum().getId());
      int count = album.getReviewsCount();
      if (count <= 1) {
        album.setRating(0);
        album.setReviewsCount(0);
      } else {
        double newRating = (album.getRating() * count - review.getRating()) / (count - 1);
        album.setRating(newRating);
        album.setReviewsCount(count - 1);
      }
    }
    reviewRepository.deleteAll(reviews);

    // 3. Delete the user. user_list rows cascade via ON DELETE CASCADE on user_list.owner_id.
    userRepository.delete(user);
  }

  @Transactional
  public UserProfileResponse resetUserPhoto(Long userId) throws IOException {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

    UserProfileResponse response = userService.resetPhotoById(userId);

    notificationService.notify(
        user, getAuthenticatedAdmin(), NotificationType.PHOTO_RESET, null, null);

    return response;
  }

  @Transactional
  public AlbumResponse updateAlbum(Long albumId, UpdateAlbumRequest request) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    album.setTitle(request.getTitle());
    if (request.getReleaseDate() != null) {
      album.setReleaseDate(request.getReleaseDate());
    }
    if (request.getCoverUrl() != null) {
      album.setCoverUrl(request.getCoverUrl());
    }
    if (request.getDescription() != null) {
      album.setDescription(request.getDescription());
    }

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  @Transactional(readOnly = true)
  public List<String> searchGenres(String query) {
    if (query == null || query.isBlank()) {
      return List.of();
    }

    return genreRepository.findTop8ByGenreContainingIgnoreCase(query.trim()).stream()
        .map(Genre::getGenre)
        .toList();
  }

  @Transactional
  public AlbumResponse addGenreToAlbum(Long albumId, AddGenreRequest request) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    String name = request.getGenre().trim();

    boolean alreadyPresent =
        album.getAlbumGenres().stream()
            .anyMatch(link -> link.getGenre().getGenre().equalsIgnoreCase(name));
    if (alreadyPresent) {
      throw new ResourceExistsException("Album already has genre '" + name + "'");
    }

    Genre genre = findOrCreateGenre(name);

    // New weight above the current max so an admin-added genre - presumably a correction - is
    // the most prominent one shown
    int maxWeight = album.getAlbumGenres().stream().mapToInt(AlbumGenre::getWeight).max().orElse(0);
    album.addGenre(genre, maxWeight + 1);

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  @Transactional
  public AlbumResponse removeGenreFromAlbum(Long albumId, String genreName) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    boolean removed =
        album
            .getAlbumGenres()
            .removeIf(link -> link.getGenre().getGenre().equalsIgnoreCase(genreName));
    if (!removed) {
      throw new ResourceNotFoundException("Album does not have genre '" + genreName + "'");
    }

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  @Transactional(readOnly = true)
  public List<org.soundtrack.api.album.dto.ArtistResponse> searchArtists(String query) {
    if (query == null || query.isBlank()) {
      return List.of();
    }

    return artistRepository.findTop8ByArtistNameContainingIgnoreCase(query.trim()).stream()
        .map(
            artist ->
                new org.soundtrack.api.album.dto.ArtistResponse(
                    artist.getId(), artist.getArtistName()))
        .toList();
  }

  @Transactional
  public AlbumResponse addArtistToAlbum(Long albumId, AddArtistRequest request) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    boolean alreadyPresent =
        album.getAlbumArtists().stream()
            .anyMatch(link -> link.getArtist().getId().equals(request.getArtistId()));
    if (alreadyPresent) {
      throw new ResourceExistsException("Album already has this artist");
    }

    Artist artist =
        artistRepository
            .findById(request.getArtistId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Artist not found with id: " + request.getArtistId()));

    int nextPosition =
        album.getAlbumArtists().stream().mapToInt(AlbumArtist::getPosition).max().orElse(-1) + 1;
    album.addArtist(artist, nextPosition);

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  @Transactional
  public AlbumResponse removeArtistFromAlbum(Long albumId, Long artistId) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    if (album.getAlbumArtists().size() <= 1) {
      throw new InvalidOperationException("Album must have at least one artist");
    }

    boolean removed =
        album.getAlbumArtists().removeIf(link -> link.getArtist().getId().equals(artistId));
    if (!removed) {
      throw new ResourceNotFoundException("Album does not have artist with id: " + artistId);
    }

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  /**
   * Adds a new track to an existing album. Credited to the album's current artists (in their
   * existing order) - the admin can adjust song-level credits afterward via the song's own
   * add/remove-artist controls, same as any other track.
   */
  @Transactional
  public SongResponse addSongToAlbum(Long albumId, AddSongToAlbumRequest request) {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    Song song = new Song();
    song.setTitle(request.getTitle());
    song.setDuration(Duration.ofSeconds(request.getDurationSeconds()));
    song.setPosition(request.getPosition());
    song.setAlbum(album);

    List<Artist> albumArtists = album.getArtists();
    for (int i = 0; i < albumArtists.size(); i++) {
      song.addArtist(albumArtists.get(i), i);
    }

    songRepository.save(song);

    return albumMapper.toSongResponse(song, Set.of());
  }

  @Transactional
  public SongResponse updateSong(Long songId, UpdateSongRequest request) {
    Song song =
        songRepository
            .findById(songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + songId));

    if (request.getPosition() != null) {
      song.setPosition(request.getPosition());
    }

    if (request.getTitle() != null) {
      song.setTitle(request.getTitle());
    }

    if (request.getDurationSeconds() != null) {
      song.setDuration(Duration.ofSeconds(request.getDurationSeconds()));
    }

    return albumMapper.toSongResponse(song, Set.of());
  }

  @Transactional
  public void deleteSong(Long songId) {
    Song song =
        songRepository
            .findById(songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + songId));

    songRepository.delete(song);
  }

  @Transactional
  public SongResponse addArtistToSong(Long songId, AddSongArtistRequest request) {
    Song song =
        songRepository
            .findById(songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + songId));

    boolean alreadyPresent =
        song.getSongArtists().stream()
            .anyMatch(link -> link.getArtist().getId().equals(request.getArtistId()));
    if (alreadyPresent) {
      throw new ResourceExistsException("Song already has this artist");
    }

    Artist artist =
        artistRepository
            .findById(request.getArtistId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Artist not found with id: " + request.getArtistId()));

    int nextPosition =
        song.getSongArtists().stream().mapToInt(SongArtist::getPosition).max().orElse(-1) + 1;
    song.addArtist(artist, nextPosition);

    return albumMapper.toSongResponse(song, Set.of());
  }

  @Transactional
  public SongResponse removeArtistFromSong(Long songId, Long artistId) {
    Song song =
        songRepository
            .findById(songId)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + songId));

    if (song.getSongArtists().size() <= 1) {
      throw new InvalidOperationException("Song must have at least one artist");
    }

    boolean removed =
        song.getSongArtists().removeIf(link -> link.getArtist().getId().equals(artistId));
    if (!removed) {
      throw new ResourceNotFoundException("Song does not have artist with id: " + artistId);
    }

    return albumMapper.toSongResponse(song, Set.of());
  }

  @Transactional
  public AlbumResponse createAlbum(CreateAlbumRequest request) {
    List<Artist> artists = artistRepository.findAllById(request.getArtistIds());
    if (artists.size() != request.getArtistIds().size()) {
      throw new ResourceNotFoundException("One or more artists not found");
    }

    Album album = new Album();
    // Manually-created albums have no MusicBrainz identity of their own; mbid/releaseid are both
    // NOT NULL UNIQUE, so a synthetic value (never collides with a real MusicBrainz UUID) fills
    // that role instead of leaving the columns meaningless.
    album.setMbid("manual-" + UUID.randomUUID());
    album.setReleaseid("manual-" + UUID.randomUUID());
    album.setTitle(request.getTitle());
    album.setReleaseDate(request.getReleaseDate());
    album.setDescription(request.getDescription());
    album.setRating(0);
    album.setReviewsCount(0);

    for (int i = 0; i < artists.size(); i++) {
      album.addArtist(artists.get(i), i);
    }

    if (request.getGenres() != null) {
      int weight = request.getGenres().size();
      for (String genreName : request.getGenres()) {
        if (genreName == null || genreName.isBlank()) {
          continue;
        }
        boolean alreadyAdded =
            album.getAlbumGenres().stream()
                .anyMatch(link -> link.getGenre().getGenre().equalsIgnoreCase(genreName.trim()));
        if (alreadyAdded) {
          continue;
        }
        album.addGenre(findOrCreateGenre(genreName.trim()), weight--);
      }
    }

    if (request.getSongs() != null) {
      Set<Song> songs = new HashSet<>();
      short position = 1;
      for (CreateSongRequest songRequest : request.getSongs()) {
        List<Artist> songArtists = artistRepository.findAllById(songRequest.getArtistIds());
        if (songArtists.size() != songRequest.getArtistIds().size()) {
          throw new ResourceNotFoundException("One or more song artists not found");
        }

        Song song = new Song();
        song.setTitle(songRequest.getTitle());
        song.setDuration(Duration.ofSeconds(songRequest.getDurationSeconds()));
        song.setPosition(position++);
        song.setAlbum(album);
        for (int i = 0; i < songArtists.size(); i++) {
          song.addArtist(songArtists.get(i), i);
        }
        songs.add(song);
      }
      album.setSongs(songs);
    }

    albumRepository.save(album);

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  private Genre findOrCreateGenre(String name) {
    return genreRepository
        .findByGenreIgnoreCase(name)
        .orElseGet(
            () -> {
              Genre newGenre = new Genre();
              newGenre.setGenre(name.toLowerCase());
              return genreRepository.save(newGenre);
            });
  }

  @Transactional
  public AlbumResponse uploadAlbumPhoto(Long albumId, MultipartFile file) throws IOException {
    Album album =
        albumRepository
            .findDetailedById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    String filename = imageStorageService.store(file, coverStoragePath, "album-" + albumId);

    if (album.getCoverUrl() != null) {
      imageStorageService.deleteIfPresent(album.getCoverUrl(), coverStoragePath);
    }

    album.setCoverUrl(filename);

    return albumMapper.toResponse(album, false, Set.of(), null);
  }

  @Transactional
  public ArtistResponse createArtist(CreateArtistRequest request) {
    Artist artist = new Artist();
    artist.setMbid("manual-" + UUID.randomUUID());
    artist.setArtistName(request.getName());
    artist.setCountry(request.getCountry());
    artist.setArtistType(request.getType());
    artist.setBiography(request.getBiography());

    artistRepository.save(artist);

    return artistMapper.toResponse(artist, Set.of());
  }

  @Transactional
  public ArtistResponse updateArtist(Long artistId, UpdateArtistRequest request) {
    Artist artist =
        artistRepository
            .findDetailedById(artistId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Artist not found with id: " + artistId));

    artist.setArtistName(request.getArtistName());
    artist.setCountry(request.getCountry());
    artist.setArtistType(request.getArtistType());
    artist.setBiography(request.getBiography());

    return artistMapper.toResponse(artist, Set.of());
  }

  @Transactional
  public ArtistResponse uploadArtistPhoto(Long artistId, MultipartFile file) throws IOException {
    Artist artist =
        artistRepository
            .findDetailedById(artistId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Artist not found with id: " + artistId));

    String filename = imageStorageService.store(file, artistPhotoStoragePath, "artist-" + artistId);

    if (artist.getArtistPic() != null && !artist.getArtistPic().equals(DEFAULT_ARTIST_PHOTO)) {
      imageStorageService.deleteIfPresent(artist.getArtistPic(), artistPhotoStoragePath);
    }

    artist.setArtistPic(filename);

    return artistMapper.toResponse(artist, Set.of());
  }

  @Transactional
  public void deleteReview(Long reviewId) {
    Review review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Review not found with id: " + reviewId));

    Album album = findAlbumForUpdate(review.getAlbum().getId());
    int count = album.getReviewsCount();
    if (count <= 1) {
      album.setRating(0);
      album.setReviewsCount(0);
    } else {
      double newRating = (album.getRating() * count - review.getRating()) / (count - 1);
      album.setRating(newRating);
      album.setReviewsCount(count - 1);
    }

    reviewRepository.delete(review);

    notificationService.notify(
        review.getUser(),
        getAuthenticatedAdmin(),
        NotificationType.REVIEW_DELETED,
        album.getId(),
        album.getTitle());
  }

  private User getAuthenticatedAdmin() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(authentication.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  /**
   * Same as a plain album lookup, but takes a row lock - required before any read-recompute-write
   * on {@code rating}/{@code reviewsCount} to avoid a lost update racing against a concurrent
   * review create/update/delete on the same album.
   *
   * @param albumId the album id
   * @return the album object
   */
  private Album findAlbumForUpdate(Long albumId) {
    return albumRepository
        .findByIdForUpdate(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found with id: " + albumId));
  }

  @Transactional(readOnly = true)
  public PagedResponse<EditRequestResponse> getEditRequests(int page, int size) {
    return editRequestService.getAllRequests(page, size);
  }

  @Transactional
  public EditRequestResponse approveEditRequest(Long requestId, String adminEmail) {
    return editRequestService.approve(requestId, adminEmail);
  }

  @Transactional
  public EditRequestResponse rejectEditRequest(Long requestId, String adminEmail) {
    return editRequestService.reject(requestId, adminEmail);
  }

  private AdminUserResponse toAdminUserResponse(User user) {
    return new AdminUserResponse(
        user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getJoinDate());
  }
}
