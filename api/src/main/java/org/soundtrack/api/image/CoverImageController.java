package org.soundtrack.api.image;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "Serve locally stored cover art and artist photos")
public class CoverImageController {

  @Value("${cover.storage.path}")
  private String coverStoragePath;

  @Value("${artist.photo.storage.path}")
  private String artistStoragePath;

  @Value("${user.photo.storage.path}")
  private String userPhotoStoragePath;

  @GetMapping("/covers/{filename}")
  @Operation(
      summary = "Get album cover image",
      description =
          "Returns the JPEG cover image for an album. The filename comes from AlbumResponse.coverUrl.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Image returned"),
    @ApiResponse(responseCode = "400", description = "Invalid filename"),
    @ApiResponse(responseCode = "404", description = "Image not found on disk")
  })
  public ResponseEntity<Resource> getCoverImage(
      @Parameter(description = "Filename from AlbumResponse.coverUrl (e.g. 481a694f-....jpg)")
          @PathVariable("filename")
          String filename)
      throws IOException {
    return serveImage(coverStoragePath, filename);
  }

  @GetMapping("/artists/{filename}")
  @Operation(
      summary = "Get artist photo",
      description =
          "Returns the JPEG photo for an artist. The filename comes from ArtistResponse.artistPic.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Image returned"),
    @ApiResponse(responseCode = "400", description = "Invalid filename"),
    @ApiResponse(responseCode = "404", description = "Image not found on disk")
  })
  public ResponseEntity<Resource> getArtistPhoto(
      @Parameter(
              description =
                  "Filename from ArtistResponse.artistPic (e.g. {mbid}.jpg or defaultArtistPhoto.jpg)")
          @PathVariable("filename")
          String filename)
      throws IOException {
    return serveImage(artistStoragePath, filename);
  }

  @GetMapping("/users/{filename}")
  @Operation(
      summary = "Get user profile photo",
      description =
          "Returns the profile photo for a user. The filename comes from"
              + " UserProfileResponse.profilePictureUrl.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Image returned"),
    @ApiResponse(responseCode = "400", description = "Invalid filename"),
    @ApiResponse(responseCode = "404", description = "Image not found on disk")
  })
  public ResponseEntity<Resource> getUserPhoto(
      @Parameter(
              description =
                  "Filename from UserProfileResponse.profilePictureUrl (e.g. userDefault.png)")
          @PathVariable("filename")
          String filename)
      throws IOException {
    return serveImage(userPhotoStoragePath, filename);
  }

  private ResponseEntity<Resource> serveImage(String storagePath, String filename)
      throws IOException {
    Path storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    Path filePath = storageRoot.resolve(filename).normalize();

    if (!filePath.startsWith(storageRoot)) {
      return ResponseEntity.badRequest().build();
    }

    if (!Files.exists(filePath)) {
      return ResponseEntity.notFound().build();
    }

    byte[] bytes = Files.readAllBytes(filePath);
    String probedType = Files.probeContentType(filePath);
    MediaType contentType =
        probedType != null ? MediaType.parseMediaType(probedType) : MediaType.IMAGE_JPEG;

    return ResponseEntity.ok()
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
        .contentType(contentType)
        .body(new ByteArrayResource(bytes));
  }
}
