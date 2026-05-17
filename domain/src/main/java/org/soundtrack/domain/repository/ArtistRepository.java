package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
  @Query("SELECT a FROM Artist a WHERE a.mbid IN :mbids")
  List<Artist> findAllByMbidIn(@Param("mbids") Set<String> mbids);

  @EntityGraph(attributePaths = {"albums"})
  Optional<Artist> findDetailedById(Long id);

  Page<Artist> findByArtistPicStartingWith(String prefix, Pageable pageable);

  @Modifying
  @Transactional
  @Query("UPDATE Artist a SET a.artistPic = 'defaultArtistPhoto.jpg' WHERE a.artistPic IS NULL")
  int setDefaultForNullPics();
}
