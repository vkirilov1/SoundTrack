package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.ChatReportStatus;
import org.soundtrack.domain.model.ChatRoomReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomReportRepository extends JpaRepository<ChatRoomReport, Long> {

  @EntityGraph(attributePaths = {"reporter", "handledBy", "resolvedBy"})
  Page<ChatRoomReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

  /** The most recent still-open (OPEN or HANDLING) report for a room, if any. */
  Optional<ChatRoomReport> findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(
      Long roomId, ChatReportStatus excludedStatus);
}
