package org.soundtrack.service;

import static java.lang.Thread.sleep;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import org.springframework.beans.factory.annotation.Value;
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

  @Value("${import.progress.path:./import-progress}")
  private String progressPath;

  public void importAllReleasesByYear(int year) throws InterruptedException {

    long startTime = System.currentTimeMillis();

    int startPage = loadStartPage(year);

    log.info(
        "Starting import for year {}{}",
        year,
        startPage > 0 ? " (resuming from page " + (startPage + 1) + ")" : "");

    int startOffset = startPage * PAGE_SIZE;

    MBReleaseGroupsDTO firstPage = client.fetchReleasesByYear(year, startOffset);

    if (firstPage == null || firstPage.releaseGroups == null) {
      log.error("Failed to fetch page {} for year {}", startPage + 1, year);
      return;
    }

    int totalCount = firstPage.count;
    int totalPages = (int) Math.ceil((double) totalCount / PAGE_SIZE);

    log.info("Total albums found for {}: {}", year, totalCount);
    log.info("Total pages to import: {}", totalPages);

    if (startPage >= totalPages) {
      log.info("Year {} already fully imported ({} pages)", year, totalPages);
      return;
    }

    importPage(firstPage, year, startOffset);
    saveProgress(year, startPage);

    for (int page = startPage + 1; page < totalPages; page++) {

      int offset = page * PAGE_SIZE;

      log.info("Fetching page {}/{} (offset={})", page + 1, totalPages, offset);

      MBReleaseGroupsDTO dto = client.fetchReleasesByYear(year, offset);

      if (dto == null || dto.releaseGroups == null || dto.releaseGroups.isEmpty()) {
        log.warn("Skipping empty page at offset {}", offset);
        saveProgress(year, page);
        continue;
      }

      importPage(dto, year, offset);
      saveProgress(year, page);

      sleep(1000);
    }

    long endTime = System.currentTimeMillis();
    long durationSeconds = (endTime - startTime) / 1000;

    log.info("Finished importing year {} in {} seconds", year, durationSeconds);
  }

  /**
   * Reads the 0-indexed page after the last one successfully completed for this year, so a rerun
   * picks up where a previous run left off instead of restarting from page 0. The file holds a
   * single plain-text page number so it can also be edited by hand to force a different offset.
   */
  private int loadStartPage(int year) {
    Path file = progressFile(year);
    if (!Files.exists(file)) {
      return 0;
    }
    try {
      int lastCompletedPage = Integer.parseInt(Files.readString(file).trim());
      return lastCompletedPage + 1;
    } catch (IOException | NumberFormatException e) {
      log.warn("Failed to read progress file {}, starting from page 0: {}", file, e.getMessage());
      return 0;
    }
  }

  private void saveProgress(int year, int completedPage) {
    Path file = progressFile(year);
    try {
      Files.createDirectories(file.getParent());
      Files.writeString(file, String.valueOf(completedPage));
    } catch (IOException e) {
      log.warn(
          "Failed to save import progress for year {} page {}: {}",
          year,
          completedPage,
          e.getMessage());
    }
  }

  private Path progressFile(int year) {
    return Paths.get(progressPath, "year-" + year + ".progress");
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
