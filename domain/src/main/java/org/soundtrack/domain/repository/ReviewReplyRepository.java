package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.ReviewReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {

  Page<ReviewReply> findByReviewId(Long reviewId, Pageable pageable);

  @Modifying
  @Query("DELETE FROM ReviewReply rr WHERE rr.user.id = :userId")
  void deleteAllByUserId(@Param("userId") Long userId);
}
