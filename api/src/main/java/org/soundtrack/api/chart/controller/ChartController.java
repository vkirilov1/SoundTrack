package org.soundtrack.api.chart.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chart.service.ChartService;
import org.soundtrack.api.common.dto.PagedResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@Tag(name = "Charts", description = "Browse albums by year or genre")
public class ChartController {

  private final ChartService chartService;

  @GetMapping("/year/{year}")
  @Operation(
      summary = "Top rated albums for a year",
      description = "Returns albums released in the given year, sorted by rating descending")
  public PagedResponse<AlbumSummaryResponse> getTopAlbumsForYear(
      @Parameter(description = "Release year") @PathVariable("year") int year,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of albums per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return chartService.getTopAlbumsForYear(year, page, size);
  }

  @GetMapping("/overall")
  @Operation(
      summary = "Top rated albums overall",
      description = "Returns overall albums, sorted by rating descending")
  public PagedResponse<AlbumSummaryResponse> getTopAlbumsOverall(
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of albums per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return chartService.getTopAlbumsOverall(page, size);
  }

  @GetMapping("/years")
  @Operation(
      summary = "Years with chart data",
      description =
          "Returns the distinct release years that have at least one reviewed album, newest"
              + " first - for the Charts page's year picker.")
  public List<Integer> getAvailableYears() {
    return chartService.getAvailableYears();
  }

  @GetMapping("/genre/{genre}")
  @Operation(
      summary = "Albums for a genre",
      description = "Returns albums tagged with the given genre, with a client-controlled sort")
  public PagedResponse<AlbumSummaryResponse> getAlbumsByGenre(
      @Parameter(description = "Genre name") @PathVariable("genre") String genre,
      @Parameter(description = "alphabetically | rating | releaseDate | reviewsCount")
          @RequestParam(name = "sort", defaultValue = "rating")
          String sort,
      @Parameter(description = "Sort direction; true = descending")
          @RequestParam(name = "descending", defaultValue = "true")
          boolean descending,
      @Parameter(description = "Zero-based page index")
          @RequestParam(name = "page", defaultValue = "0")
          int page,
      @Parameter(description = "Number of albums per page")
          @RequestParam(name = "size", defaultValue = "20")
          int size) {
    return chartService.getAlbumsByGenre(genre, sort, descending, page, size);
  }
}
