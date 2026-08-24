package org.soundtrack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArtistPhotoDownloader {

  @Value("${artist.photo.storage.path}")
  private String storagePath;

  private final RemoteFileDownloader downloader;

  /** {@code mbid} is used as the filename on disk ({@code {mbid}.jpg}). */
  public String downloadAndSave(String imageUrl, String mbid) {
    return downloader.downloadAndSave(imageUrl, mbid, storagePath, "photo");
  }
}
