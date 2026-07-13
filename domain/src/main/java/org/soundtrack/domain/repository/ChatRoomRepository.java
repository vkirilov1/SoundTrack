package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.TopicType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

  List<ChatRoom> findByTopicTypeAndTopicId(TopicType topicType, Long topicId);

  List<ChatRoom> findByTopicType(TopicType topicType);

  @EntityGraph(attributePaths = {"creator", "members"})
  @Query("SELECT r FROM ChatRoom r WHERE r.id = :id")
  Optional<ChatRoom> findWithMembersById(@Param("id") Long id);

  @Query("SELECT COUNT(u) FROM ChatRoom r JOIN r.members u WHERE r.id = :roomId")
  int countMembersById(@Param("roomId") Long roomId);
}
