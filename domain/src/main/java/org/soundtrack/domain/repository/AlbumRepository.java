package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.Album;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
  @Query("SELECT a.mbid FROM Album a WHERE a.mbid IN :mbids")
  Set<String> findExistingMbids(@Param("mbids") Set<String> mbids);

  @EntityGraph(
      attributePaths = {"artists", "albumGenres", "albumGenres.genre", "songs", "songs.artists"})
  Optional<Album> findDetailedById(Long id);

  @EntityGraph(attributePaths = {"artists"})
  List<Album> findTop8ByTitleContainingIgnoreCase(String title);

  @EntityGraph(attributePaths = {"albumGenres"})
  List<Album> findByMbidIn(Set<String> mbids);

  @Query("SELECT a FROM Album a WHERE NOT EXISTS (SELECT 1 FROM AlbumGenre ag WHERE ag.album = a)")
  List<Album> findAlbumsWithNoGenres();
}
