package org.soundtrack.service;

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
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.model.Song;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.dto.*;
import org.soundtrack.validator.ReleaseValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Imports a single release into its own transaction. Every entity this touches - artists resolved
 * from MusicBrainz, the album itself and its song/artist/genre links - is loaded and saved within
 * this one transaction, so a failure here (e.g. two different MusicBrainz release-groups pointing
 * at the same underlying release, tripping the {@code releaseid} unique constraint) only rolls back
 * this release. It never leaves the page-level loop in {@link ReleaseImportService} holding a
 * poisoned Hibernate session, which is what let one bad release take down an entire page's worth of
 * imports.
 */
@Service
@RequiredArgsConstructor
public class ReleaseWriter {

  private static final Logger log = LoggerFactory.getLogger(ReleaseWriter.class);

  private final MusicBrainzClient client;
  private final ReleaseValidator validator;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final CoverImageDownloader coverImageDownloader;
  private final ArtistPhotoDownloader artistPhotoDownloader;

  /**
   * Validates, resolves and saves a single release. {@code genreMap} is built once per page by
   * {@link ReleaseImportService} and passed in read-only; {@link Genre} references stay valid
   * across transactions because {@code AlbumGenre.genre} is a plain, non-cascading association
   * (unlike {@code AlbumArtist.artist}, which uses {@code @MapsId} and therefore requires artists
   * to be resolved within this same transaction).
   *
   * @param release the release dto
   * @param genreMap page-wide genre name to saved {@link Genre}
   * @throws InterruptedException for sleep()
   */
  @Transactional
  public void importRelease(MBReleaseDTO release, Map<String, Genre> genreMap)
      throws InterruptedException {

    if (!validator.isValidAlbum(release)) return;

    if (albumRepository.existsByMbid(release.id)) {
      log.debug("Skipping already imported album (mbid race): {}", release.title);
      return;
    }

    CoverArtResult coverArtResult =
        client.findCoverArt(release.releases.stream().map(r -> r.id).toList(), release.title);

    if (coverArtResult == null) return;

    if (albumRepository.existsByReleaseid(coverArtResult.releaseId())) {
      log.debug(
          "Skipping '{}': release '{}' already claimed by another release-group",
          release.title,
          coverArtResult.releaseId());
      return;
    }

    String coverFilename =
        coverImageDownloader.downloadAndSave(coverArtResult.coverUrl(), coverArtResult.releaseId());

    List<Artist> albumArtists = resolveArtists(release.artistCredit);

    if (albumArtists.isEmpty()) return;

    Album album = mapAlbumToEntity(release, coverArtResult, coverFilename);

    MBReleaseRecordingDTO releaseRecordingDTO =
        client.fetchReleaseRecording(coverArtResult.releaseId());

    if (releaseRecordingDTO != null) {
      Set<Song> songs = mapSongsToEntity(releaseRecordingDTO, album);
      album.setSongs(songs);
    }

    for (Map.Entry<String, Integer> tagWeight : dedupeTagWeights(release.tags).entrySet()) {
      Genre genre = genreMap.get(tagWeight.getKey());
      if (genre != null) {
        album.addGenre(genre, tagWeight.getValue());
      }
    }

    for (int position = 0; position < albumArtists.size(); position++) {
      album.addArtist(albumArtists.get(position), position);
    }

    log.debug(
        "Saving album {} with {} artists, {} genres, and {} songs",
        album.getTitle(),
        albumArtists.size(),
        album.getAlbumGenres().size(),
        album.getSongs().size());

    albumRepository.save(album);
    log.debug("Successfully saved new album: {}", album.getTitle());
  }

  /**
   * Collapses a release's tag list down to one weight per genre name. MusicBrainz can list the same
   * tag name more than once for a release (e.g. merged from multiple sub-releases); without this,
   * {@link Album#addGenre} would create two distinct AlbumGenre link rows for the same (album,
   * genre) pair and violate the {@code uq_album_genre} constraint on save. When a name repeats, the
   * higher vote count wins.
   *
   * @param tags the release's raw tag list, possibly null
   * @return genre name (trimmed) to relevance weight, deduplicated
   */
  private Map<String, Integer> dedupeTagWeights(List<MBReleaseDTO.TagDTO> tags) {
    if (tags == null) {
      return Map.of();
    }

    Map<String, Integer> weightsByName = new LinkedHashMap<>();
    for (MBReleaseDTO.TagDTO tag : tags) {
      weightsByName.merge(tag.name.trim(), tag.count, Math::max);
    }
    return weightsByName;
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

    List<String> orderedMbids =
        credits.stream()
            .filter(c -> c.artist != null && c.artist.id != null)
            .map(c -> c.artist.id)
            .distinct()
            .toList();

    Map<String, Artist> artistsByMbid =
        resolveArtistsByMbids(new LinkedHashSet<>(orderedMbids)).stream()
            .collect(Collectors.toMap(Artist::getMbid, Function.identity()));

    return orderedMbids.stream().map(artistsByMbid::get).filter(Objects::nonNull).toList();
  }

  /**
   * Maps a ReleaseDTO to an album
   *
   * @param dto the release dto
   * @param coverArtResult the cover art result for CoverArchive
   * @return the album
   */
  private Album mapAlbumToEntity(
      MBReleaseDTO dto, CoverArtResult coverArtResult, String coverFilename) {
    Album album = new Album();
    album.setMbid(dto.id);
    album.setReleaseid(coverArtResult.releaseId());
    album.setTitle(dto.title);
    // Store local filename; fall back to remote URL if download failed
    album.setCoverUrl(coverFilename != null ? coverFilename : coverArtResult.coverUrl());

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
  private Set<Song> mapSongsToEntity(MBReleaseRecordingDTO releaseRecordingDTO, Album album)
      throws InterruptedException {

    if (releaseRecordingDTO.media == null || releaseRecordingDTO.media.isEmpty()) {
      return Collections.emptySet();
    }

    // A release can bundle multiple media - extra discs, alternate mixes, bonus live discs, deluxe
    // box-set reissues. Flattening every medium's tracks together produces several different discs'
    // worth of songs all claiming the same "position 1, 2, 3..." sequence. Fetching only the
    // primary disc (first-listed)
    List<MBReleaseRecordingDTO.Track> tracks =
        releaseRecordingDTO.media.stream()
            .filter(m -> m.tracks != null)
            .findFirst()
            .map(m -> m.tracks)
            .orElse(List.of());

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

    Set<Song> songs = new HashSet<>();

    for (MBReleaseRecordingDTO.Track track : tracks) {

      Song song = new Song();

      song.setMbid(track.id);
      song.setTitle(track.title);
      song.setPosition(Objects.requireNonNullElse(track.position, (short) 0));
      song.setDuration(Duration.ofMillis(track.length));
      song.setAlbum(album);

      if (track.artistCredits != null) {

        Set<String> seenArtistMbids = new HashSet<>();
        int position = 0;

        for (MBReleaseRecordingDTO.ArtistCredit credit : track.artistCredits) {

          if (credit.artist == null || credit.artist.id == null) {
            continue;
          }

          if (!seenArtistMbids.add(credit.artist.id)) {
            continue;
          }

          Artist artist = artistsByMbid.get(credit.artist.id);

          if (artist != null) {
            song.addArtist(artist, position);
            position++;
          }
        }
      }

      songs.add(song);
    }

    return songs;
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

      String photoFilename =
          (imageUrl != null)
              ? artistPhotoDownloader.downloadAndSave(imageUrl, mbArtist.id)
              : "defaultArtistPhoto.jpg";

      if (photoFilename == null) {
        photoFilename = "defaultArtistPhoto.jpg";
      }

      Artist artist = mapArtistToEntity(mbArtist, photoFilename);

      artistRepository.save(artist);

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
