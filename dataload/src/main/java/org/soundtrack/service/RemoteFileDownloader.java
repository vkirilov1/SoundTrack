package org.soundtrack.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.client.HttpClients;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RemoteFileDownloader {

  private static final Logger log = LoggerFactory.getLogger(RemoteFileDownloader.class);

  private final RestTemplate restTemplate = HttpClients.createRestTemplate();

  /**
   * @param kind used only in log messages (e.g. "cover", "photo")
   * @return the filename to store in the DB, or null if download failed
   */
  public String downloadAndSave(String imageUrl, String id, String storagePath, String kind) {
    String filename = id + ".jpg";
    Path destination = Paths.get(storagePath, filename);

    if (Files.exists(destination)) {
      log.debug("{} already exists locally for {}", kind, id);
      return filename;
    }

    try {
      Files.createDirectories(destination.getParent());

      ResponseEntity<byte[]> response =
          restTemplate.exchange(imageUrl, HttpMethod.GET, HttpClients.buildHeaders(), byte[].class);

      if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
        Files.write(destination, response.getBody());
        log.debug("Saved {} for {} ({} bytes)", kind, id, response.getBody().length);
        return filename;
      }

    } catch (IOException e) {
      log.error("Failed to write {} for {} to disk: {}", kind, id, e.getMessage());
    } catch (Exception e) {
      log.warn("Failed to download {} for {}: {}", kind, id, e.getMessage());
    }

    return null;
  }
}
