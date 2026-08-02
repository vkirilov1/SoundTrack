package org.soundtrack.domain.repository;

import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.FavoriteAlbum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteAlbumRepository extends JpaRepository<FavoriteAlbum, Long> {

  @EntityGraph(attributePaths = {"album", "album.albumArtists"})
  Page<FavoriteAlbum> findByUserId(Long userId, Pageable pageable);

  Optional<FavoriteAlbum> findByUserIdAndAlbumId(Long userId, Long albumId);

  boolean existsByUserIdAndAlbumId(Long userId, Long albumId);

  @Query(
      "SELECT fa.album.id FROM FavoriteAlbum fa WHERE fa.user.id = :userId AND fa.album.id IN"
          + " :albumIds")
  Set<Long> findFavoritedAlbumIdsByUserIdAndAlbumIdIn(
      @Param("userId") Long userId, @Param("albumIds") Set<Long> albumIds);
}
