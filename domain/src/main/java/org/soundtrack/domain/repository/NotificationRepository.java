package org.soundtrack.domain.repository;

import org.soundtrack.domain.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  @EntityGraph(attributePaths = {"actor"})
  Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

  long countByRecipientIdAndReadFalse(Long recipientId);

  @Modifying
  @Transactional
  @Query(
      "UPDATE Notification n SET n.read = true WHERE n.recipient.id = :recipientId AND n.read = false")
  int markAllAsRead(@Param("recipientId") Long recipientId);

  void deleteByRecipientId(Long recipientId);
}
