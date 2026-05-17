package org.soundtrack.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CoverImageDownloader {

  private static final Logger log = LoggerFactory.getLogger(CoverImageDownloader.class);

  @Value("${cover.storage.path}")
  private String storagePath;

  private final RestTemplate restTemplate = new RestTemplate();

  /**
   * Downloads a cover image from the given URL and saves it to the configured storage path.
   *
   * @param imageUrl the CoverArtArchive URL to download from
   * @param releaseId used as the filename ({releaseId}.jpg)
   * @return the filename to store in the DB, or null if download failed
   */
  public String downloadAndSave(String imageUrl, String releaseId) {
    String filename = releaseId + ".jpg";
    Path destination = Paths.get(storagePath, filename);

    if (Files.exists(destination)) {
      log.debug("Cover already exists locally for release {}", releaseId);
      return filename;
    }

    try {
      Files.createDirectories(destination.getParent());

      ResponseEntity<byte[]> response =
          restTemplate.exchange(imageUrl, HttpMethod.GET, buildHeaders(), byte[].class);

      if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
        Files.write(destination, response.getBody());
        log.debug("Saved cover for release {} ({} bytes)", releaseId, response.getBody().length);
        return filename;
      }

    } catch (IOException e) {
      log.error("Failed to write cover for release {} to disk: {}", releaseId, e.getMessage());
    } catch (Exception e) {
      log.warn("Failed to download cover for release {}: {}", releaseId, e.getMessage());
    }

    return null;
  }

  private HttpEntity<Void> buildHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("User-Agent", "soundtrack-app/1.0 soundtrack.devs@gmail.com");
    return new HttpEntity<>(headers);
  }
}
