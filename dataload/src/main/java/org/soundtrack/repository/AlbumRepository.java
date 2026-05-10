package org.soundtrack.repository;

import java.util.Set;
import org.soundtrack.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
  @Query("SELECT a.mbid FROM Album a WHERE a.mbid IN :mbids")
  Set<String> findExistingMbids(@Param("mbids") Set<String> mbids);
}
