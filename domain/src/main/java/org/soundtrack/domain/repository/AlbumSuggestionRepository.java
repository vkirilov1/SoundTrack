package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.AlbumSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumSuggestionRepository extends JpaRepository<AlbumSuggestion, Long> {

  @EntityGraph(attributePaths = {"submittedBy", "reviewedBy"})
  Page<AlbumSuggestion> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
