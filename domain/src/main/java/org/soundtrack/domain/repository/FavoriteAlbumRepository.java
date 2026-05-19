package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.FavoriteAlbum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteAlbumRepository extends JpaRepository<FavoriteAlbum, Long> {

  @EntityGraph(attributePaths = {"album", "album.artists"})
  Page<FavoriteAlbum> findByUserId(Long userId, Pageable pageable);

  Optional<FavoriteAlbum> findByUserIdAndAlbumId(Long userId, Long albumId);

  boolean existsByUserIdAndAlbumId(Long userId, Long albumId);
}
