package org.soundtrack.api.upcoming.service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.admin.dto.CreateAlbumRequest;
import org.soundtrack.api.admin.dto.CreateSongRequest;
import org.soundtrack.api.album.dto.AlbumResponse;
import org.soundtrack.api.album.mapper.AlbumMapper;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.upcoming.dto.UpcomingReleaseResponse;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.Song;
import org.soundtrack.domain.model.UpcomingRelease;
import org.soundtrack.domain.model.UpcomingReleasePayload;
import org.soundtrack.domain.model.UpcomingReleasePayload.ArtistCredit;
import org.soundtrack.domain.model.UpcomingReleasePayload.SongDraft;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.GenreRepository;
import org.soundtrack.domain.repository.UpcomingReleaseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UpcomingReleaseService {

  private final UpcomingReleaseRepository upcomingReleaseRepository;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final GenreRepository genreRepository;
  private final AlbumMapper albumMapper;
  private final ImageStorageService imageStorageService;

  @Value("${cover.storage.path}")
  private String coverStoragePath;

  @Transactional(readOnly = true)
  public PagedResponse<UpcomingReleaseResponse> getUpcomingReleases(int page, int size) {
    Page<UpcomingRelease> releasePage =
        upcomingReleaseRepository.findAllByOrderByReleaseDateAsc(PageRequest.of(page, size));

    List<UpcomingReleaseResponse> content =
        releasePage.getContent().stream().map(this::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, releasePage.getTotalElements(), releasePage.getTotalPages());
  }

  /** Same request shape as {@code AdminService.createAlbum} */
  @Transactional
  public UpcomingReleaseResponse create(CreateAlbumRequest request) {
    List<Artist> artists = artistRepository.findAllById(request.getArtistIds());
    if (artists.size() != request.getArtistIds().size()) {
      throw new ResourceNotFoundException("One or more artists not found");
    }

    List<SongDraft> songDrafts = List.of();
    if (request.getSongs() != null) {
      songDrafts = request.getSongs().stream().map(this::toSongDraft).toList();
    }

    UpcomingReleasePayload payload =
        new UpcomingReleasePayload(
            request.getDescription(),
            artists.stream().map(this::toCredit).toList(),
            request.getGenres() != null ? request.getGenres() : List.of(),
            songDrafts);

    UpcomingRelease release =
        UpcomingRelease.builder()
            .title(request.getTitle())
            .releaseDate(request.getReleaseDate())
            .payload(payload)
            .build();

    return toResponse(upcomingReleaseRepository.save(release));
  }

  @Transactional
  public UpcomingReleaseResponse uploadCoverPhoto(Long id, MultipartFile file) throws IOException {
    UpcomingRelease release = findRelease(id);

    String filename = imageStorageService.store(file, coverStoragePath, "upcoming-" + id);

    if (release.getCoverUrl() != null) {
      imageStorageService.deleteIfPresent(release.getCoverUrl(), coverStoragePath);
    }

    release.setCoverUrl(filename);

    return toResponse(release);
  }

  /**
   * Promotes an upcoming release into a real, published {@link Album} - the same construction
   * {@code AdminService.createAlbum}
   */
  @Transactional
  public AlbumResponse publish(Long id) {
    UpcomingRelease release = findRelease(id);

    if (release.getReleaseDate().isAfter(LocalDate.now())) {
      throw new InvalidOperationException("This release isn't out yet");
    }

    UpcomingReleasePayload payload = release.getPayload();

    Album album = new Album();
    album.setMbid("manual-" + UUID.randomUUID());
    album.setReleaseid("manual-" + UUID.randomUUID());
    album.setTitle(release.getTitle());
    album.setReleaseDate(release.getReleaseDate());
    album.setDescription(payload.description());
    album.setCoverUrl(release.getCoverUrl());
    album.setRating(0);
    album.setReviewsCount(0);

    Map<Long, Artist> resolvedArtists = resolveCredits(payload.artists(), "artists");
    List<ArtistCredit> credits = payload.artists();
    for (int i = 0; i < credits.size(); i++) {
      album.addArtist(resolvedArtists.get(credits.get(i).id()), i);
    }

    int weight = payload.genres().size();
    for (String genreName : payload.genres()) {
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

    if (!payload.songs().isEmpty()) {
      Set<Song> songs = new HashSet<>();
      short position = 1;
      for (SongDraft songDraft : payload.songs()) {
        Map<Long, Artist> resolvedSongArtists = resolveCredits(songDraft.artists(), "song artists");

        Song song = new Song();
        song.setTitle(songDraft.title());
        song.setDuration(Duration.ofSeconds(songDraft.durationSeconds()));
        song.setPosition(position++);
        song.setAlbum(album);
        List<ArtistCredit> songCredits = songDraft.artists();
        for (int i = 0; i < songCredits.size(); i++) {
          song.addArtist(resolvedSongArtists.get(songCredits.get(i).id()), i);
        }
        songs.add(song);
      }
      album.setSongs(songs);
    }

    Album saved = albumRepository.save(album);
    upcomingReleaseRepository.delete(release);

    return albumMapper.toResponse(saved, false, Set.of(), null);
  }

  @Transactional
  public void delete(Long id) throws IOException {
    UpcomingRelease release = findRelease(id);

    if (release.getCoverUrl() != null) {
      imageStorageService.deleteIfPresent(release.getCoverUrl(), coverStoragePath);
    }

    upcomingReleaseRepository.delete(release);
  }

  private Map<Long, Artist> resolveCredits(List<ArtistCredit> credits, String label) {
    List<Long> ids = credits.stream().map(ArtistCredit::id).toList();
    List<Artist> artists = artistRepository.findAllById(ids);
    if (artists.size() != ids.size()) {
      throw new ResourceNotFoundException("One or more " + label + " no longer exist");
    }
    return artists.stream().collect(Collectors.toMap(Artist::getId, a -> a));
  }

  private SongDraft toSongDraft(CreateSongRequest songRequest) {
    List<Artist> songArtists = artistRepository.findAllById(songRequest.getArtistIds());
    if (songArtists.size() != songRequest.getArtistIds().size()) {
      throw new ResourceNotFoundException("One or more song artists not found");
    }
    return new SongDraft(
        songRequest.getTitle(),
        songRequest.getDurationSeconds(),
        songArtists.stream().map(this::toCredit).toList());
  }

  private ArtistCredit toCredit(Artist artist) {
    return new ArtistCredit(artist.getId(), artist.getArtistName());
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

  private UpcomingReleaseResponse toResponse(UpcomingRelease release) {
    return new UpcomingReleaseResponse(
        release.getId(),
        release.getTitle(),
        release.getCoverUrl(),
        release.getReleaseDate(),
        release.getPayload().artists().stream().map(ArtistCredit::name).toList(),
        !release.getReleaseDate().isAfter(LocalDate.now()));
  }

  private UpcomingRelease findRelease(Long id) {
    return upcomingReleaseRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Upcoming release not found"));
  }
}
