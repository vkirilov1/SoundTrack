package org.soundtrack.validator;

import org.soundtrack.dto.MBReleaseDTO;
import org.springframework.stereotype.Component;

@Component
public class ReleaseValidator {

  /**
   * Main validation method used before importing an album.
   *
   * @param release MusicBrainz release
   * @return true if album is valid, false if not
   */
  public boolean isValidAlbum(MBReleaseDTO release) {
    return hasReleases(release) && !isNonMusic(release);
  }

  /**
   * Checks if release-group contains at least one release.
   *
   * @param release MusicBrainz release
   * @return true if any release are present, false if not
   */
  public boolean hasReleases(MBReleaseDTO release) {
    return release.releases != null && !release.releases.isEmpty();
  }

  /**
   * Checks if release is tagged as "non-music" or has no tags in order to avoid non-music material.
   *
   * @param release MusicBrainz release
   * @return true if the release has the tag or no tags, false if not
   */
  public boolean isNonMusic(MBReleaseDTO release) {
    if (release.tags == null) {
      return true;
    }

    return hasTag(release, "non-music");
  }

  /**
   * Checks if a release contains a certain tag.
   *
   * @param release MusicBrainz release
   * @param tagName the name of the tag
   * @return true if the release has the tag, false if not
   */
  public boolean hasTag(MBReleaseDTO release, String tagName) {
    if (release.tags == null) return false;

    return release.tags.stream().anyMatch(tag -> tagName.equalsIgnoreCase(tag.name));
  }
}
