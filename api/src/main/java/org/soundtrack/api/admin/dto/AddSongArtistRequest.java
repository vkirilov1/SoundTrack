package org.soundtrack.api.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddSongArtistRequest {

  @NotNull(message = "Artist is required")
  private Long artistId;
}
