package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

  @EntityGraph(attributePaths = {"sender"})
  Page<ChatMessage> findByRoomIdOrderBySentAtDesc(Long roomId, Pageable pageable);
}
