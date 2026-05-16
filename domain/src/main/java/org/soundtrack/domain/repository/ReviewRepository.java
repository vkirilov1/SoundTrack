package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Review;
import org.soundtrack.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserAndAlbum(User user, Album album);
    Page<Review> findByAlbumId(Long albumId, Pageable pageable);
}
