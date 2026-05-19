package org.soundtrack.domain.repository;

import java.util.List;
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

  Page<Review> findByAlbumId(Long albumId, Pageable pageable);

  @EntityGraph(attributePaths = {"album"})
  @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
  List<Review> findByUserId(@Param("userId") Long userId);
}
