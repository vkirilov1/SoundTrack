package org.soundtrack.api.common.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.springframework.mock.web.MockMultipartFile;

class ImageStorageServiceTest {

  private final ImageStorageService imageStorageService = new ImageStorageService();

  @TempDir Path tempDir;

  @Test
  void rejectsAnEmptyFile() {
    MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[0]);

    assertThatThrownBy(() -> imageStorageService.store(file, tempDir.toString(), "user-1"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void rejectsANonImageContentType() {
    MockMultipartFile file =
        new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[] {1, 2, 3});

    assertThatThrownBy(() -> imageStorageService.store(file, tempDir.toString(), "user-1"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void storesAJpegWithAJpgExtension() throws IOException {
    MockMultipartFile file =
        new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[] {1, 2, 3});

    String filename = imageStorageService.store(file, tempDir.toString(), "user-1");

    assertThat(filename).startsWith("user-1-").endsWith(".jpg");
    assertThat(Files.readAllBytes(tempDir.resolve(filename))).containsExactly(1, 2, 3);
  }

  @Test
  void storesAPngWithAPngExtension() throws IOException {
    MockMultipartFile file =
        new MockMultipartFile("file", "photo.png", "image/png", new byte[] {4, 5, 6});

    String filename = imageStorageService.store(file, tempDir.toString(), "artist-1");

    assertThat(filename).endsWith(".png");
  }

  @Test
  void deleteIfPresentIsANoOpForANullFilename() throws IOException {
    imageStorageService.deleteIfPresent(null, tempDir.toString());
  }

  @Test
  void deleteIfPresentRemovesAnExistingFile() throws IOException {
    Path file = tempDir.resolve("photo.jpg");
    Files.write(file, new byte[] {1});

    imageStorageService.deleteIfPresent("photo.jpg", tempDir.toString());

    assertThat(Files.exists(file)).isFalse();
  }

  @Test
  void deleteIfPresentRefusesToEscapeTheStorageRoot(@TempDir Path outside) throws IOException {
    Path secret = outside.resolve("secret.txt");
    Files.write(secret, new byte[] {1});
    String traversal = tempDir.relativize(secret).toString();

    imageStorageService.deleteIfPresent(traversal, tempDir.toString());

    assertThat(Files.exists(secret)).isTrue();
  }
}
