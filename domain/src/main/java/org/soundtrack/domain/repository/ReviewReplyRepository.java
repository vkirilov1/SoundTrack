package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.ReviewReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {

  Page<ReviewReply> findByReviewId(Long reviewId, Pageable pageable);
}
