package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.EditRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface EditRequestRepository extends JpaRepository<EditRequest, Long> {

  @EntityGraph(attributePaths = {"requestedBy", "reviewedBy"})
  Page<EditRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

  @Modifying
  @Transactional
  void deleteByRequestedById(Long userId);

  @Modifying
  @Transactional
  @Query("UPDATE EditRequest e SET e.reviewedBy = null WHERE e.reviewedBy.id = :userId")
  void clearReviewedBy(@Param("userId") Long userId);
}
