package org.soundtrack.validator;

import org.soundtrack.dto.MBReleaseDTO;
import org.springframework.stereotype.Component;

@Component
public class ReleaseValidator {

  public boolean isValidAlbum(MBReleaseDTO release) {
    return hasReleases(release) && !isNonMusic(release);
  }

  public boolean hasReleases(MBReleaseDTO release) {
    return release.releases != null && !release.releases.isEmpty();
  }

  /** An untagged release is treated as non-music too, not as "unknown" - excluded either way. */
  public boolean isNonMusic(MBReleaseDTO release) {
    if (release.tags == null) {
      return true;
    }

    return hasTag(release, "non-music");
  }

  public boolean hasTag(MBReleaseDTO release, String tagName) {
    if (release.tags == null) return false;

    return release.tags.stream().anyMatch(tag -> tagName.equalsIgnoreCase(tag.name));
  }
}
