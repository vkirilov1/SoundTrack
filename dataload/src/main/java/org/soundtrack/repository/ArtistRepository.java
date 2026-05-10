package org.soundtrack.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
  Optional<Artist> findByMbid(String mbid);

  @Query("SELECT a FROM Artist a WHERE a.mbid IN :mbids")
  List<Artist> findAllByMbidIn(@Param("mbids") Set<String> mbids);
}
