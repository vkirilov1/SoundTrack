package org.soundtrack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoverImageDownloader {

  @Value("${cover.storage.path}")
  private String storagePath;

  private final RemoteFileDownloader downloader;

  /** {@code releaseId} is used as the filename on disk ({@code {releaseId}.jpg}). */
  public String downloadAndSave(String imageUrl, String releaseId) {
    return downloader.downloadAndSave(imageUrl, releaseId, storagePath, "cover");
  }
}
