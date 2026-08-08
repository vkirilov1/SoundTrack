package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
  Optional<Genre> findByGenre(String genre);

  Optional<Genre> findByGenreIgnoreCase(String genre);

  // Fetches all genres where the name is in the provided set
  List<Genre> findAllByGenreIn(Set<String> genreNames);

  // Autocomplete for the admin "add genre" search box
  List<Genre> findTop8ByGenreContainingIgnoreCase(String query);
}
