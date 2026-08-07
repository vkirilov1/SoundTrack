package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
  boolean existsByUserAndAlbum(User user, Album album);

  Optional<Review> findByUserAndAlbum(User user, Album album);

  Page<Review> findByAlbumId(Long albumId, Pageable pageable);

  /**
   * Same reviews as {@link #findByAlbumId}, but reviews from users {@code viewerId} follows are
   * pinned to the top regardless of date - the ad hoc join only matches a follow row for the
   * viewer, so its presence (or absence) becomes the primary sort key. Falls back to the plain
   * createdAt order for reviews from anyone the viewer doesn't follow, same as before.
   */
  @Query(
      "SELECT r FROM Review r LEFT JOIN UserFollow uf ON uf.following.id = r.user.id AND uf.follower.id = :viewerId "
          + "WHERE r.album.id = :albumId "
          + "ORDER BY CASE WHEN uf.id IS NOT NULL THEN 0 ELSE 1 END ASC, r.createdAt DESC")
  Page<Review> findByAlbumIdOrderByFollowedFirst(
      @Param("albumId") Long albumId, @Param("viewerId") Long viewerId, Pageable pageable);

  @EntityGraph(attributePaths = {"album"})
  @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
  List<Review> findByUserId(@Param("userId") Long userId);

  @EntityGraph(attributePaths = {"album"})
  @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
  Page<Review> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
