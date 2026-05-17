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
public class ArtistPhotoDownloader {

  private static final Logger log = LoggerFactory.getLogger(ArtistPhotoDownloader.class);

  @Value("${artist.photo.storage.path}")
  private String storagePath;

  private final RestTemplate restTemplate = new RestTemplate();

  /**
   * Downloads an artist photo from the given Wikimedia URL and saves it to the configured storage
   * path as {mbid}.jpg.
   *
   * @param imageUrl the Wikimedia Special:FilePath URL
   * @param mbid used as the filename on disk
   * @return the filename to store in the DB, or null if download failed
   */
  public String downloadAndSave(String imageUrl, String mbid) {
    String filename = mbid + ".jpg";
    Path destination = Paths.get(storagePath, filename);

    if (Files.exists(destination)) {
      log.debug("Photo already exists locally for artist {}", mbid);
      return filename;
    }

    try {
      Files.createDirectories(destination.getParent());

      ResponseEntity<byte[]> response =
          restTemplate.exchange(imageUrl, HttpMethod.GET, buildHeaders(), byte[].class);

      if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
        Files.write(destination, response.getBody());
        log.debug("Saved photo for artist {} ({} bytes)", mbid, response.getBody().length);
        return filename;
      }

    } catch (IOException e) {
      log.error("Failed to write photo for artist {} to disk: {}", mbid, e.getMessage());
    } catch (Exception e) {
      log.warn("Failed to download photo for artist {}: {}", mbid, e.getMessage());
    }

    return null;
  }

  private HttpEntity<Void> buildHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("User-Agent", "soundtrack-app/1.0 soundtrack.devs@gmail.com");
    return new HttpEntity<>(headers);
  }
}
