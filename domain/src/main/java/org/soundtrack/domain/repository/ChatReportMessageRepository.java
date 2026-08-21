package org.soundtrack.domain.repository;

import java.util.List;
import org.soundtrack.domain.model.ChatReportMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatReportMessageRepository extends JpaRepository<ChatReportMessage, Long> {

  List<ChatReportMessage> findByReportIdOrderBySentAt(Long reportId);
}
