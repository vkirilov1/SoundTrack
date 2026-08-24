package org.soundtrack.domain.repository;

import java.util.Collection;
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

  List<ChatRoom> findByCreatorId(Long creatorId);

  @EntityGraph(attributePaths = {"creator", "members"})
  List<ChatRoom> findByTopicTypeAndTopicIdIn(TopicType topicType, Collection<Long> topicIds);

  @EntityGraph(attributePaths = {"creator", "members"})
  @Query("SELECT r FROM ChatRoom r WHERE r.id = :id")
  Optional<ChatRoom> findWithMembersById(@Param("id") Long id);

  /** The room the user is currently a member of, if any - users can be in at most one room. */
  @Query("SELECT r FROM ChatRoom r JOIN r.members m WHERE m.id = :userId")
  Optional<ChatRoom> findByMemberId(@Param("userId") Long userId);

  /** Whether the user has a pending join request anywhere, counted toward the one-room limit. */
  @Query("SELECT COUNT(r) > 0 FROM ChatRoom r JOIN r.joinRequests jr WHERE jr.id = :userId")
  boolean hasPendingJoinRequest(@Param("userId") Long userId);

  @Query(
      "SELECT COUNT(r) > 0 FROM ChatRoom r JOIN r.joinRequests jr WHERE jr.id = :userId AND r.id"
          + " <> :roomId")
  boolean hasPendingJoinRequestElsewhere(
      @Param("userId") Long userId, @Param("roomId") Long roomId);

  @Query("SELECT COUNT(u) FROM ChatRoom r JOIN r.members u WHERE r.id = :roomId")
  int countMembersById(@Param("roomId") Long roomId);
}
