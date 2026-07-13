package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.UserFollow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

  @EntityGraph(attributePaths = {"follower"})
  Page<UserFollow> findByFollowingId(Long followingId, Pageable pageable);

  @EntityGraph(attributePaths = {"following"})
  Page<UserFollow> findByFollowerId(Long followerId, Pageable pageable);

  Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

  boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
