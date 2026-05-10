package org.soundtrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** DTO class for MusicBrainz release-groups object */
public class MBReleaseGroupsDTO {
  @JsonProperty("count")
  public int count;

  @JsonProperty("release-groups")
  public List<MBReleaseDTO> releaseGroups;
}
