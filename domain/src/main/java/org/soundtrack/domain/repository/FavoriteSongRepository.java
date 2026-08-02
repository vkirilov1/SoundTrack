package org.soundtrack.domain.repository;

import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.FavoriteSong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteSongRepository extends JpaRepository<FavoriteSong, Long> {

  @EntityGraph(attributePaths = {"song", "song.album", "song.songArtists"})
  Page<FavoriteSong> findByUserId(Long userId, Pageable pageable);

  Optional<FavoriteSong> findByUserIdAndSongId(Long userId, Long songId);

  boolean existsByUserIdAndSongId(Long userId, Long songId);

  @Query("SELECT fs.song.id FROM FavoriteSong fs WHERE fs.user.id = :userId AND fs.song.album.id = :albumId")
  Set<Long> findFavoritedSongIdsByUserIdAndAlbumId(
      @Param("userId") Long userId, @Param("albumId") Long albumId);
}
