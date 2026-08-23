package org.soundtrack.domain.repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.UserFollow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

  @EntityGraph(attributePaths = {"follower"})
  Page<UserFollow> findByFollowingId(Long followingId, Pageable pageable);

  @EntityGraph(attributePaths = {"following"})
  Page<UserFollow> findByFollowerId(Long followerId, Pageable pageable);

  Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

  boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

  long countByFollowingId(Long followingId);

  /**
   * Of the given candidate ids, which ones {@code followerId} already follows. Used to batch-mark
   * "followed" on a page of users (e.g. a followers/following list) in one query instead of N.
   */
  @Query(
      "SELECT uf.following.id FROM UserFollow uf "
          + "WHERE uf.follower.id = :followerId AND uf.following.id IN :followingIds")
  Set<Long> findFollowingIdsByFollowerIdAndFollowingIdIn(
      @Param("followerId") Long followerId, @Param("followingIds") Collection<Long> followingIds);

  /**
   * Of the given candidate ids, which ones already follow {@code followingId}. Used to batch-mark
   * "followsYou" on a page of users in one query instead of N.
   */
  @Query(
      "SELECT uf.follower.id FROM UserFollow uf "
          + "WHERE uf.following.id = :followingId AND uf.follower.id IN :followerIds")
  Set<Long> findFollowerIdsByFollowingIdAndFollowerIdIn(
      @Param("followingId") Long followingId, @Param("followerIds") Collection<Long> followerIds);
}
