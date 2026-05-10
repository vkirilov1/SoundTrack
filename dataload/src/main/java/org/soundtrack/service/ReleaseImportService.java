package org.soundtrack.service;

import jakarta.transaction.Transactional;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.client.MusicBrainzClient;
import org.soundtrack.dto.*;
import org.soundtrack.entity.Album;
import org.soundtrack.entity.Artist;
import org.soundtrack.entity.Genre;
import org.soundtrack.entity.Song;
import org.soundtrack.repository.AlbumRepository;
import org.soundtrack.repository.ArtistRepository;
import org.soundtrack.repository.GenreRepository;
import org.soundtrack.validator.ReleaseValidator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReleaseImportService {

  private final MusicBrainzClient client;
  private final ReleaseValidator validator;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final GenreRepository genreRepository;
  private static final Logger log = LoggerFactory.getLogger(ReleaseImportService.class);

  /**
   * Fetches albums from the MusicBrainz API for a given year
   *
   * @param year the year to fetch albums from
   * @param offset offset for the response
   * @throws InterruptedException for sleep()
   */
  @Transactional
  public void importReleasesByYear(int year, int offset) throws InterruptedException {

    MBReleaseGroupsDTO dto = client.fetchReleasesByYear(year, offset);

    if (dto == null || dto.releaseGroups == null || dto.releaseGroups.isEmpty()) {
      log.debug("Fetching albums by year {} failed.", year);
      return;
    }

    log.debug("Saving all unique genres for year {} with offset {}", year, offset);
    Map<String, Genre> genreMap = saveUniqueGenres(dto);
    log.debug("Successfully saved genres");

    Set<String> incomingMbids =
        dto.releaseGroups.stream().map(release -> release.id).collect(Collectors.toSet());

    Set<String> existingMbids = albumRepository.findExistingMbids(incomingMbids);

    for (MBReleaseDTO release : dto.releaseGroups) {
      if (existingMbids.contains(release.id)) {
        log.debug("Skipping already imported album: {} (ID: {})", release.title, release.id);
        continue;
      }

      validateAndSaveRelease(release, genreMap);
    }
  }

  /**
   * Validates a release and saves it to the database
   *
   * @param release the release dto
   * @throws InterruptedException for sleep()
   */
  private void validateAndSaveRelease(MBReleaseDTO release, Map<String, Genre> genreMap)
      throws InterruptedException {

    if (!validator.isValidAlbum(release)) return;

    CoverArtResult coverArtResult =
        client.findCoverArt(release.releases.stream().map(r -> r.id).toList(), release.title);

    if (coverArtResult == null) return;

    List<Artist> albumArtists = resolveArtists(release.artistCredit);

    if (albumArtists.isEmpty()) return;

    Album album = mapAlbumToEntity(release, coverArtResult);

    MBReleaseRecordingDTO releaseRecordingDTO =
        client.fetchReleaseRecording(coverArtResult.releaseId());

    if (releaseRecordingDTO != null) {
      List<Song> songs = mapSongsToEntity(releaseRecordingDTO, album);
      album.setSongs(songs);
    }

    if (release.tags != null) {
      for (MBReleaseDTO.TagDTO tag : release.tags) {
        Genre genre = genreMap.get(tag.name);
        if (genre != null) {
          album.addGenre(genre);
        }
      }
    }

    for (Artist artist : albumArtists) {
      album.addArtist(artist);
    }

    log.debug(
        "Saving album {} with {} artists, {} genres, and {} songs",
        album.getTitle(),
        albumArtists.size(),
        album.getGenres().size(),
        album.getSongs().size());

    saveAlbum(album);
  }

  /**
   * Resolves Artists from ArtistCreditDTO
   *
   * @param credits of the artists
   * @return List of the artists
   * @throws InterruptedException for sleep()
   */
  private List<Artist> resolveArtists(List<MBReleaseDTO.ArtistCreditDTO> credits)
      throws InterruptedException {

    if (credits == null || credits.isEmpty()) {
      return List.of();
    }

    Set<String> mbids =
        credits.stream()
            .filter(c -> c.artist != null && c.artist.id != null)
            .map(c -> c.artist.id)
            .collect(Collectors.toSet());

    return resolveArtistsByMbids(mbids);
  }

  /**
   * Maps a ReleaseDTO to an album
   *
   * @param dto the release dto
   * @param coverArtResult the cover art result for CoverArchive
   * @return the album
   */
  private Album mapAlbumToEntity(MBReleaseDTO dto, CoverArtResult coverArtResult) {
    Album album = new Album();
    album.setMbid(dto.id);
    album.setReleaseid(coverArtResult.releaseId());
    album.setTitle(dto.title);
    album.setCoverUrl(coverArtResult.coverUrl());

    if (dto.releaseDate != null && !dto.releaseDate.isEmpty()) {
      album.setReleaseDate(parseDate(dto.releaseDate));
    }

    return album;
  }

  /**
   * Maps an ArtistDTO to an artist
   *
   * @param dto the artist dto
   * @param imageUrl the image url for the artist (could be null)
   * @return the artist
   */
  private Artist mapArtistToEntity(MBArtistDTO dto, String imageUrl) {
    Artist artist = new Artist();

    artist.setMbid(dto.id);
    artist.setArtistName(dto.name);
    artist.setCountry(dto.country);
    artist.setArtistType(dto.type);
    artist.setArtistPic(imageUrl);

    // biography is null upon dataload

    return artist;
  }

  /**
   * Maps an ReleaseRecordingDTO to songs and return a list of the songs
   *
   * @param releaseRecordingDTO the releaseRecording dto
   * @param album the album to which the songs belong to
   * @return the List containing the songs
   * @throws InterruptedException for sleep()
   */
  private List<Song> mapSongsToEntity(MBReleaseRecordingDTO releaseRecordingDTO, Album album)
      throws InterruptedException {

    if (releaseRecordingDTO.media == null || releaseRecordingDTO.media.isEmpty()) {
      return new ArrayList<>();
    }

    List<MBReleaseRecordingDTO.Track> tracks =
        releaseRecordingDTO.media.stream()
            .filter(m -> m.tracks != null)
            .flatMap(m -> m.tracks.stream())
            .toList();

    Set<String> allArtistMbids =
        tracks.stream()
            .filter(track -> track.artistCredits != null)
            .flatMap(track -> track.artistCredits.stream())
            .filter(credit -> credit.artist != null && credit.artist.id != null)
            .map(credit -> credit.artist.id)
            .collect(Collectors.toSet());

    Map<String, Artist> artistsByMbid =
        resolveArtistsByMbids(allArtistMbids).stream()
            .collect(Collectors.toMap(Artist::getMbid, Function.identity()));

    List<Song> songs = new ArrayList<>();

    for (MBReleaseRecordingDTO.Track track : tracks) {

      Song song = new Song();

      song.setMbid(track.id);
      song.setTitle(track.title);
      song.setPosition(Objects.requireNonNullElse(track.position, (short) 0));
      song.setDuration(Duration.ofMillis(track.length));
      song.setAlbum(album);

      if (track.artistCredits != null) {

        for (MBReleaseRecordingDTO.ArtistCredit credit : track.artistCredits) {

          if (credit.artist == null || credit.artist.id == null) {
            continue;
          }

          Artist artist = artistsByMbid.get(credit.artist.id);

          if (artist != null) {
            song.addArtist(artist);
          }
        }
      }

      songs.add(song);
    }

    return songs;
  }

  /**
   * Saves an album to the database
   *
   * @param album the album
   */
  private void saveAlbum(Album album) {
    try {
      albumRepository.save(album);
      log.debug("Successfully saved new album: {}", album.getTitle());
    } catch (DataIntegrityViolationException e) {
      log.debug(
          "Failed to save album '{}' due to unique constraint: {}",
          album.getTitle(),
          e.getMessage());
    }
  }

  /**
   * Saves an artist to the database
   *
   * @param artist the artist
   */
  private void saveArtist(Artist artist) {
    try {
      artistRepository.save(artist);
    } catch (DataIntegrityViolationException e) {
      log.debug(
          "Failed to save artist '{}' due to unique constraint: {}",
          artist.getArtistName(),
          e.getMessage());
    }
  }

  /**
   * Fetches all unique genres (tags) from the ReleaseGroup dto and saves them to the database
   * returns a map with the saved genres that can be used in an outer function
   *
   * @param dto containing releases
   * @return map with the saved unique genres
   */
  private Map<String, Genre> saveUniqueGenres(MBReleaseGroupsDTO dto) {
    Set<String> allTagNames =
        dto.releaseGroups.stream()
            .filter(r -> r.tags != null)
            .flatMap(r -> r.tags.stream())
            .map(tag -> tag.name.trim())
            .collect(Collectors.toSet());

    Map<String, Genre> genreMap =
        genreRepository.findAllByGenreIn(allTagNames).stream()
            .collect(Collectors.toMap(Genre::getGenre, g -> g));

    for (String tagName : allTagNames) {
      if (!genreMap.containsKey(tagName)) {
        Genre newGenre = new Genre();
        newGenre.setGenre(tagName);
        genreMap.put(tagName, genreRepository.save(newGenre));
      }
    }

    return genreMap;
  }

  /**
   * Checks if artists exist in the db If they don't, fetches them from MusicBrainz through {@code
   * fetchArtistById}
   *
   * @param mbids the musicbrainz ids of the artists
   * @return List of the found artists
   * @throws InterruptedException for sleep()
   */
  private List<Artist> resolveArtistsByMbids(Set<String> mbids) throws InterruptedException {

    if (mbids == null || mbids.isEmpty()) {
      return List.of();
    }

    List<Artist> existingArtists = artistRepository.findAllByMbidIn(mbids);

    Map<String, Artist> resultMap =
        existingArtists.stream().collect(Collectors.toMap(Artist::getMbid, a -> a));

    List<Artist> result = new ArrayList<>(existingArtists);

    for (String mbid : mbids) {

      if (resultMap.containsKey(mbid)) {
        continue;
      }

      MBArtistDTO mbArtist = client.fetchArtistById(mbid);

      if (mbArtist == null) {
        continue;
      }

      String wikidataId = extractWikidataId(mbArtist);

      String imageUrl = client.fetchArtistImageUrl(wikidataId);

      Artist artist = mapArtistToEntity(mbArtist, imageUrl);

      saveArtist(artist);

      result.add(artist);
      resultMap.put(mbid, artist);
    }

    return result;
  }

  /**
   * Format from MusicBrainz - yyyy-mm-dd Possible dates received from MusicWorld - yyyy ; yyyy-mm ;
   * yyyy-mm-dd
   *
   * @param dateStr String containing the date
   * @return the formatted date
   */
  private LocalDate parseDate(String dateStr) {
    try {
      if (dateStr.length() == 4) {
        return LocalDate.of(Integer.parseInt(dateStr), 1, 1);
      } else if (dateStr.length() == 7) {
        return LocalDate.parse(dateStr + "-01");
      } else {
        return LocalDate.parse(dateStr);
      }
    } catch (DateTimeParseException | NumberFormatException e) {
      return null;
    }
  }

  /**
   * Obtains wikidata id for the artist
   *
   * @param artist the artist
   * @return the id
   */
  private String extractWikidataId(MBArtistDTO artist) {
    if (artist.relations == null) return null;

    return artist.relations.stream()
        .filter(r -> "wikidata".equals(r.type))
        .map(r -> r.url.resource)
        .map(url -> url.substring(url.lastIndexOf("/") + 1))
        .findFirst()
        .orElse(null);
  }
}
