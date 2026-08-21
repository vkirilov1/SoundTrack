package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

  @EntityGraph(attributePaths = {"sender"})
  Page<ChatMessage> findByRoomIdOrderBySentAtDesc(Long roomId, Pageable pageable);

  @Modifying(flushAutomatically = true, clearAutomatically = true)
  @Query("DELETE FROM ChatMessage m WHERE m.room.id = :roomId")
  void deleteByRoomId(@Param("roomId") Long roomId);
}
