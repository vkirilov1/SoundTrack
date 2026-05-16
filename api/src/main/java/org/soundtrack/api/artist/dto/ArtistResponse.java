package org.soundtrack.api.artist.dto;

import java.util.List;

public record ArtistResponse(
    Long id,
    String name,
    String country,
    String type,
    String biography,
    String artistPic,
    List<AlbumResponse> albums) {}
