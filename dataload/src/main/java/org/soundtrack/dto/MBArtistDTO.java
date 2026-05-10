package org.soundtrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MBArtistDTO {

  @JsonProperty("id")
  public String id;

  @JsonProperty("name")
  public String name;

  @JsonProperty("country")
  public String country;

  @JsonProperty("type")
  public String type;

  @JsonProperty("relations")
  public List<RelationDTO> relations;

  public static class RelationDTO {
    @JsonProperty("type")
    public String type;

    @JsonProperty("url")
    public UrlDTO url;
  }

  public static class UrlDTO {
    @JsonProperty("resource")
    public String resource;
  }
}
