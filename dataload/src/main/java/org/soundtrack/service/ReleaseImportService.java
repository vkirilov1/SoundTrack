package org.soundtrack.service;

import static java.lang.Thread.sleep;

import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.client.MusicBrainzClient;
import org.soundtrack.domain.model.Genre;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.GenreRepository;
import org.soundtrack.dto.*;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReleaseImportService {

  private final MusicBrainzClient client;
  private final AlbumRepository albumRepository;
  private final GenreRepository genreRepository;
  private final ReleaseWriter releaseWriter;
  private static final Logger log = LoggerFactory.getLogger(ReleaseImportService.class);

  private static final int PAGE_SIZE = 100;

  public void importAllReleasesByYear(int year) throws InterruptedException {

    long startTime = System.currentTimeMillis();

    log.info("Starting import for year {}", year);

    MBReleaseGroupsDTO firstPage = client.fetchReleasesByYear(year, 0);

    if (firstPage == null || firstPage.releaseGroups == null) {
      log.error("Failed to fetch first page for year {}", year);
      return;
    }

    int totalCount = firstPage.count;
    int totalPages = (int) Math.ceil((double) totalCount / PAGE_SIZE);

    log.info("Total albums found for {}: {}", year, totalCount);
    log.info("Total pages to import: {}", totalPages);

    importPage(firstPage, year, 0);

    for (int page = 1; page < totalPages; page++) {

      int offset = page * PAGE_SIZE;

      log.info("Fetching page {}/{} (offset={})", page + 1, totalPages, offset);

      MBReleaseGroupsDTO dto = client.fetchReleasesByYear(year, offset);

      if (dto == null || dto.releaseGroups == null || dto.releaseGroups.isEmpty()) {
        log.warn("Skipping empty page at offset {}", offset);
        continue;
      }

      importPage(dto, year, offset);

      sleep(1000);
    }

    long endTime = System.currentTimeMillis();
    long durationSeconds = (endTime - startTime) / 1000;

    log.info("Finished importing year {} in {} seconds", year, durationSeconds);
  }

  private void importPage(MBReleaseGroupsDTO dto, int year, int offset)
      throws InterruptedException {

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

      try {
        releaseWriter.importRelease(release, genreMap);
      } catch (DataAccessException e) {
        log.warn(
            "Failed to import release '{}' (ID: {}), skipping: {}",
            release.title,
            release.id,
            e.getMessage());
      }
    }
    log.info("Imported page with offset {}", offset);
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

    return resolveGenres(allTagNames);
  }

  /**
   * Looks up existing {@link Genre} rows for the given names, creating any that don't exist yet.
   *
   * @param tagNames genre/tag names to resolve, already trimmed
   * @return name to saved {@link Genre}
   */
  private Map<String, Genre> resolveGenres(Set<String> tagNames) {
    Map<String, Genre> genreMap =
        genreRepository.findAllByGenreIn(tagNames).stream()
            .collect(Collectors.toMap(Genre::getGenre, g -> g));

    for (String tagName : tagNames) {
      if (!genreMap.containsKey(tagName)) {
        Genre newGenre = new Genre();
        newGenre.setGenre(tagName);
        genreMap.put(tagName, genreRepository.save(newGenre));
      }
    }

    return genreMap;
  }
}
