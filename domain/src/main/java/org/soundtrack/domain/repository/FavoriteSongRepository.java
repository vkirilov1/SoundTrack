package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.FavoriteSong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteSongRepository extends JpaRepository<FavoriteSong, Long> {

  @EntityGraph(attributePaths = {"song", "song.album", "song.artists"})
  Page<FavoriteSong> findByUserId(Long userId, Pageable pageable);

  Optional<FavoriteSong> findByUserIdAndSongId(Long userId, Long songId);

  boolean existsByUserIdAndSongId(Long userId, Long songId);
}
