package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.EditRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EditRequestRepository extends JpaRepository<EditRequest, Long> {

  @EntityGraph(attributePaths = {"requestedBy", "reviewedBy"})
  Page<EditRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
