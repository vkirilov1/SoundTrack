package org.soundtrack.api.common.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Shared JPEG/PNG file storage helper for the flat filesystem directories used by user photos,
 * album covers, and artist photos - validation, filename generation, and deletion are identical
 * across all three, only the storage root and filename prefix differ.
 */
@Component
public class ImageStorageService {

  public String store(MultipartFile file, String storagePath, String filenamePrefix)
      throws IOException {
    validateImageFile(file);

    Path storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    Files.createDirectories(storageRoot);

    String filename = filenamePrefix + "-" + UUID.randomUUID() + extensionOf(file);
    Path target = storageRoot.resolve(filename).normalize();

    file.transferTo(target);

    return filename;
  }

  public void deleteIfPresent(String filename, String storagePath) throws IOException {
    if (filename == null) {
      return;
    }

    Path storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    Path currentPath = storageRoot.resolve(filename).normalize();

    if (currentPath.startsWith(storageRoot)) {
      Files.deleteIfExists(currentPath);
    }
  }

  private void validateImageFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new InvalidOperationException("No file provided");
    }

    String contentType = file.getContentType();

    if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
      throw new InvalidOperationException("Only JPEG or PNG images are allowed");
    }
  }

  private String extensionOf(MultipartFile file) {
    String contentType = file.getContentType();
    return "image/png".equals(contentType) ? ".png" : ".jpg";
  }
}
