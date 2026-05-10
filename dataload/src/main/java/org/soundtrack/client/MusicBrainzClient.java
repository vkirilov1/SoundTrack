package org.soundtrack.client;

import static java.lang.Thread.sleep;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.dto.*;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

@Component
public class MusicBrainzClient {

  private static final String BASE_URL = "https://musicbrainz.org/ws/2/release-group";

  private static final String COVERART_ARCHIVE_BASE_URL = "https://coverartarchive.org/release/";

  private static final String ARTIST_URL = "https://musicbrainz.org/ws/2/artist/";

  private final RestTemplate restTemplate = new RestTemplate();

  private static final Logger log = LoggerFactory.getLogger(MusicBrainzClient.class);

  /**
   * Obtain all official albums from a year through pagination via offset
   *
   * @param year the year from which to take the albums
   * @param offset offset for pagination
   * @return the albums
   */
  public MBReleaseGroupsDTO fetchReleasesByYear(int year, int offset) {
    String url =
        UriComponentsBuilder.fromHttpUrl(BASE_URL)
            .queryParam(
                "query",
                String.format(
                    "primarytype:album AND firstreleasedate:%d AND status:official", year))
            .queryParam("limit", 100)
            .queryParam("offset", offset)
            .queryParam("fmt", "json")
            .build(false)
            .toUriString();

    log.debug("Fetching albums from MusicBrainz with url: {}", url);

    try {
      ResponseEntity<MBReleaseGroupsDTO> response =
          restTemplate.exchange(url, HttpMethod.GET, buildHeaders(), MBReleaseGroupsDTO.class);

      log.debug("Response status: {}", response.getStatusCode());
      return response.getBody();

    } catch (RestClientException e) {
      log.error(
          "Failed to fetch albums for year {} at offset {}. Error: {}",
          year,
          offset,
          e.getMessage(),
          e);

      return null;
    }
  }

  /**
   * Fetches artist data from musicbrainz
   *
   * @param mbid the id of the artist
   * @return the artist dto
   */
  public MBArtistDTO fetchArtistById(String mbid) throws InterruptedException {
    String url =
        UriComponentsBuilder.fromHttpUrl(ARTIST_URL + "{mbid}")
            .queryParam("inc", "url-rels")
            .queryParam("fmt", "json")
            .buildAndExpand(mbid)
            .toUriString();

    sleep(1000);
    log.debug("Fetching artist with id '{}'", mbid);
    try {
      ResponseEntity<MBArtistDTO> response =
          restTemplate.exchange(url, HttpMethod.GET, buildHeaders(), MBArtistDTO.class);

      return response.getBody();
    } catch (RestClientException e) {
      log.error("Failed to fetch artist {}: {}", mbid, e.getMessage());
      return null;
    }
  }

  /**
   * Fetches release recordings that contain song data
   *
   * @param releaseId the releaseid of the album to fetch songs from
   * @return the ReleaseRecordingDTO
   * @throws InterruptedException for sleep()
   */
  public MBReleaseRecordingDTO fetchReleaseRecording(String releaseId) throws InterruptedException {
    String url =
        UriComponentsBuilder.fromHttpUrl("https://musicbrainz.org/ws/2/release/{releaseId}")
            .queryParam("inc", "recordings+artist-credits")
            .queryParam("fmt", "json")
            .buildAndExpand(releaseId)
            .toUriString();

    sleep(1000);

    log.debug("Fetching release recordings for id '{}'", releaseId);

    try {
      ResponseEntity<MBReleaseRecordingDTO> response =
          restTemplate.exchange(url, HttpMethod.GET, buildHeaders(), MBReleaseRecordingDTO.class);

      return response.getBody();
    } catch (RestClientException e) {
      log.error("Failed to fetch release recordings for {}: {}", releaseId, e.getMessage());
      return null;
    }
  }

  /**
   * Creates the url to the cover art of the album, stored in coverartarchive.org Tries fetching the
   * release first in order to ensure release is available
   *
   * @param releaseIds List containing the releaseIds to verify and return covers for
   * @return the result containing correct releaseId and url to the cover
   */
  public CoverArtResult findCoverArt(List<String> releaseIds, String title)
      throws InterruptedException {

    for (String releaseId : releaseIds) {
      String url = COVERART_ARCHIVE_BASE_URL + releaseId;

      log.debug("Fetching album cover for album '{}' from CoverArchive with url: {}", title, url);

      for (int attempt = 0; attempt < 3; attempt++) {

        sleep(1000);

        try {
          ResponseEntity<String> response =
              restTemplate.exchange(url, HttpMethod.GET, buildHeaders(), String.class);

          if (response.getStatusCode().is2xxSuccessful()) {
            log.debug("Found cover art for album '{}' using release '{}'", title, releaseId);
            return new CoverArtResult(releaseId, url + "/front");
          }

        } catch (HttpServerErrorException.InternalServerError e) {
          log.warn("Received 500 error for {}, attempt {}/3", title, attempt + 1);
          if (attempt < 2) {
            sleep(1000);
            continue;
          }
        } catch (HttpServerErrorException.ServiceUnavailable e) {

          sleep(1000);

        } catch (Exception e) {
          break;
        }
        break;
      }
    }
    log.debug("Failed to find cover art for album: {}", title);
    return null;
  }

  /**
   * Fetches the url pointing to an image of an artist by wikidataId
   *
   * @param wikidataId the id
   * @return the url
   */
  public String fetchArtistImageUrl(String wikidataId) throws InterruptedException {

    if (wikidataId == null) {
      return null;
    }

    String url = "https://www.wikidata.org/wiki/Special:EntityData/" + wikidataId + ".json";

    log.debug("Fetching artist image from wikidata entity data: '{}'", url);

    int maxRetries = 5;

    for (int attempt = 0; attempt < maxRetries; attempt++) {

      try {

        sleep(250);

        ResponseEntity<WikidataEntityResponse> response =
            restTemplate.exchange(
                url, HttpMethod.GET, buildHeaders(), WikidataEntityResponse.class);

        if (response.getBody() == null || response.getBody().entities == null) {

          return null;
        }

        WikidataEntityResponse.Entity entity = response.getBody().entities.get(wikidataId);

        if (entity == null
            || entity.claims == null
            || entity.claims.P18 == null
            || entity.claims.P18.isEmpty()) {

          return null;
        }

        String fileName = entity.claims.P18.get(0).mainsnak.datavalue.value;

        if (fileName == null || fileName.isBlank()) {
          return null;
        }

        return buildCommonsImageUrl(fileName);

      } catch (HttpClientErrorException.TooManyRequests e) {

        long waitTime = extractRetryAfter(e);

        log.warn(
            "Wikidata rate limit hit for {}. Retry {}/{}. Waiting {} ms",
            wikidataId,
            attempt + 1,
            maxRetries,
            waitTime);

        sleep(waitTime);

      } catch (Exception e) {

        log.warn("Failed to fetch image for wikidata id {}", wikidataId, e);

        return null;
      }
    }

    log.warn("Exceeded max retries for wikidata id {}", wikidataId);

    return null;
  }

  /**
   * Generic headers when sending requests
   *
   * @return HttpEntity
   */
  private HttpEntity<Void> buildHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("User-Agent", "soundtrack-app/1.0 soundtrack.devs@gmail.com");
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    return new HttpEntity<>(headers);
  }

  /**
   * Extracts Retry-After property from the return
   *
   * @param e TooManyRequests exception
   * @return seconds to wait before retrying
   */
  private long extractRetryAfter(HttpClientErrorException.TooManyRequests e) {

    String retryAfter =
        e.getResponseHeaders() != null ? e.getResponseHeaders().getFirst("Retry-After") : null;

    if (retryAfter != null) {
      try {

        return Long.parseLong(retryAfter) * 1000;

      } catch (NumberFormatException ignored) {
      }
    }

    return 3000;
  }

  /**
   * @param fileName
   * @return
   */
  private String buildCommonsImageUrl(String fileName) {

    return "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + UriUtils.encodePath(fileName, StandardCharsets.UTF_8);
  }
}
