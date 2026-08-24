package org.soundtrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/** Wikidata keys every fact by an opaque property code - "P18" is the one for "image". */
public class WikidataEntityResponse {

  public Map<String, Entity> entities;

  public static class Entity {
    public Claims claims;
  }

  public static class Claims {
    @JsonProperty("P18")
    public List<P18Claim> P18;
  }

  public static class P18Claim {
    public MainSnak mainsnak;
  }

  public static class MainSnak {
    public DataValue datavalue;
  }

  public static class DataValue {
    public String value;
  }
}
