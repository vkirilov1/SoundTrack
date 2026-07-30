package org.soundtrack.api.search.mapper;

import java.util.stream.Collectors;
import org.soundtrack.api.search.dto.SearchResultResponse;
import org.soundtrack.api.search.dto.SearchResultType;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.springframework.stereotype.Component;

@Component
public class SearchMapper {

  public SearchResultResponse toAlbumResult(Album album) {
    String artistNames =
        album.getArtists().stream().map(Artist::getArtistName).collect(Collectors.joining(", "));

    return SearchResultResponse.builder()
        .id(album.getId())
        .type(SearchResultType.ALBUM)
        .title(album.getTitle())
        .subtitle(artistNames)
        .imageUrl(album.getCoverUrl())
        .build();
  }

  public SearchResultResponse toArtistResult(Artist artist) {
    return SearchResultResponse.builder()
        .id(artist.getId())
        .type(SearchResultType.ARTIST)
        .title(artist.getArtistName())
        .subtitle(artist.getCountry())
        .imageUrl(artist.getArtistPic())
        .build();
  }
}
