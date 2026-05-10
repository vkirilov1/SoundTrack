package org.soundtrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** DTO class for MusicBrainz release DTO from release-groups object */
public class MBReleaseDTO {
  @JsonProperty("id")
  public String id;

  @JsonProperty("title")
  public String title;

  @JsonProperty("first-release-date")
  public String releaseDate;

  @JsonProperty("releases")
  public List<ReleaseDTO> releases;

  @JsonProperty("artist-credit")
  public List<ArtistCreditDTO> artistCredit;

  // album genres are stored in tags
  @JsonProperty("tags")
  public List<TagDTO> tags;

  public static class TagDTO {
    @JsonProperty("count")
    public int count;

    @JsonProperty("name")
    public String name;
  }

  public static class ArtistCreditDTO {
    @JsonProperty("artist")
    public ArtistDTO artist;

    public static class ArtistDTO {
      @JsonProperty("id")
      public String id;

      @JsonProperty("name")
      public String name;
    }
  }

  public static class ReleaseDTO {
    @JsonProperty("id")
    public String id;
  }
}
