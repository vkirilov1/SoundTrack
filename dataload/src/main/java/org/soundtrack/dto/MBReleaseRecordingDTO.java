package org.soundtrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MBReleaseRecordingDTO {
  @JsonProperty("media")
  public List<Medium> media;

  public static class Medium {
    @JsonProperty("tracks")
    public List<Track> tracks;
  }

  public static class Track {
    @JsonProperty("position")
    public Short position;

    @JsonProperty("id")
    public String id;

    @JsonProperty("title")
    public String title;

    @JsonProperty("length")
    public int length; // Duration in milliseconds

    @JsonProperty("artist-credit")
    public List<ArtistCredit> artistCredits;
  }

  public static class ArtistCredit {
    public ArtistDTO artist;
  }

  public static class ArtistDTO {
    @JsonProperty("id")
    public String id;
  }
}
