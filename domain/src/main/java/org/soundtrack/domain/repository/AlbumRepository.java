package org.soundtrack.domain.repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
  @Query("SELECT a.mbid FROM Album a WHERE a.mbid IN :mbids")
  Set<String> findExistingMbids(@Param("mbids") Set<String> mbids);

  boolean existsByMbid(String mbid);

  boolean existsByReleaseid(String releaseid);

  /**
   * Same as {@link #findById}, but takes a {@code SELECT ... FOR UPDATE} row lock. Every write path
   * that recomputes {@code rating}/{@code reviewsCount} from the album's current values (review
   * create/update/delete) must read the album through this method rather than {@code findById}: two
   * concurrent requests reading the same unlocked row would both compute their new average from the
   * same stale snapshot, and the second commit would silently overwrite the first's - a classic
   * lost update. Locking here serializes concurrent writers on the same album so the second one
   * always reads the first's committed result before recomputing.
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT a FROM Album a WHERE a.id = :id")
  Optional<Album> findByIdForUpdate(@Param("id") Long id);

  @EntityGraph(
      attributePaths = {
        "albumArtists",
        "albumGenres",
        "albumGenres.genre",
        "songs",
        "songs.songArtists"
      })
  Optional<Album> findDetailedById(Long id);

  @EntityGraph(attributePaths = {"albumArtists"})
  List<Album> findTop8ByTitleContainingIgnoreCase(String title);

  /**
   * Reviewed albums released in the given date range (inclusive), ordered by Bayesian-weighted
   * rating (highest first, ties broken alphabetically) for the Year's chart page. Unreviewed albums
   * are excluded.
   */
  @Query(
      "SELECT a FROM Album a "
          + "WHERE a.releaseDate BETWEEN :start AND :end AND a.reviewsCount > 0 "
          + "ORDER BY ((a.reviewsCount * a.rating) + (:m * :globalMean)) / (a.reviewsCount + :m) DESC, "
          + "a.title ASC")
  Page<Album> findByReleaseDateBetweenOrderByWeightedRating(
      @Param("start") LocalDate start,
      @Param("end") LocalDate end,
      @Param("m") double m,
      @Param("globalMean") double globalMean,
      Pageable pageable);

  @Query(
      "SELECT a FROM Album a "
          + "WHERE a.reviewsCount > 0 "
          + "ORDER BY ((a.reviewsCount * a.rating) + (:m * :globalMean)) / (a.reviewsCount + :m) DESC, "
          + "a.title ASC")
  Page<Album> findByOverallOrderByWeightedRating(
      @Param("m") double m, @Param("globalMean") double globalMean, Pageable pageable);

  /** Albums tagged with the given genre (case-insensitive), for the Genre's chart page. */
  @Query(
      "SELECT a FROM Album a JOIN a.albumGenres ag JOIN ag.genre g WHERE LOWER(g.genre) = LOWER(:genre)")
  Page<Album> findByGenreIgnoreCase(@Param("genre") String genre, Pageable pageable);

  /**
   * Same as {@link #findByGenreIgnoreCase}, ordered by Bayesian-weighted rating instead of a plain
   * property sort. {@code sign} is {@code 1} for descending, {@code -1} for ascending. Unreviewed
   * albums are also selected, but always sort after every reviewed album regardless of direction -
   * the weighted formula alone would rank them near the site mean (no evidence defaults to
   * "average"), which reads as a real score they haven't earned. The "has reviews" flag is the
   * primary sort key and ignores {@code sign} on purpose; the weighted score only breaks ties
   * within each group.
   */
  @Query(
      "SELECT a FROM Album a JOIN a.albumGenres ag JOIN ag.genre g "
          + "WHERE LOWER(g.genre) = LOWER(:genre) "
          + "ORDER BY CASE WHEN a.reviewsCount = 0 THEN 1 ELSE 0 END ASC, "
          + "(((a.reviewsCount * a.rating) + (:m * :globalMean)) / (a.reviewsCount + :m)) * :sign DESC, "
          + "a.title ASC")
  Page<Album> findByGenreIgnoreCaseOrderByWeightedRating(
      @Param("genre") String genre,
      @Param("m") double m,
      @Param("globalMean") double globalMean,
      @Param("sign") double sign,
      Pageable pageable);

  /** Mean rating across reviewed albums (the "C" baseline for the weighted-rating formula). */
  @Query("SELECT COALESCE(AVG(a.rating), 0) FROM Album a WHERE a.reviewsCount > 0")
  double findGlobalAverageRating();

  /**
   * Distinct release years with at least one reviewed album, newest first - for the Charts page's
   * year picker.
   */
  @Query(
      "SELECT DISTINCT YEAR(a.releaseDate) FROM Album a WHERE a.reviewsCount > 0 ORDER BY YEAR(a.releaseDate) DESC")
  List<Integer> findDistinctYearsWithReviews();
}
