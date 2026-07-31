package org.soundtrack.domain.repository;

import java.util.List;
import org.soundtrack.domain.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
  List<Song> findByAlbumId(Long albumId);
}
