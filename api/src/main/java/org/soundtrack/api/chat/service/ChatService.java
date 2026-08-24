package org.soundtrack.api.chat.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.ChatRoomEventResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse.MemberStatus;
import org.soundtrack.api.chat.dto.ChatRoomResponse.UserSummary;
import org.soundtrack.api.chat.dto.CreateRoomRequest;
import org.soundtrack.api.chat.dto.JoinRoomResponse;
import org.soundtrack.api.chat.dto.JoinRoomResponse.JoinStatus;
import org.soundtrack.api.chat.dto.SendMessagePayload;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ChatRoomFullException;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.ChatMessage;
import org.soundtrack.domain.model.ChatReportCategory;
import org.soundtrack.domain.model.ChatReportMessage;
import org.soundtrack.domain.model.ChatReportResolution;
import org.soundtrack.domain.model.ChatReportStatus;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.ChatRoomReport;
import org.soundtrack.domain.model.MessageType;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.TopicType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.ChatReportMessageRepository;
import org.soundtrack.domain.repository.ChatRoomReportRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Live-only chat rooms: max {@value #MAX_CAPACITY} members, a user can be in at most one room at a
 * time, and a room exists only while its owner is present - when the owner leaves (or their
 * connection stays dead past the grace period) the room and its messages are deleted and every
 * member is notified via a ROOM_CLOSED event.
 */
@Service
@RequiredArgsConstructor
public class ChatService {

  public static final int MAX_CAPACITY = 20;

  private static final int REPORT_CONTEXT_MESSAGE_COUNT = 20;

  private final ChatRoomRepository chatRoomRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomReportRepository chatRoomReportRepository;
  private final ChatReportMessageRepository chatReportMessageRepository;
  private final UserRepository userRepository;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final NotificationService notificationService;
  private final SimpMessagingTemplate messagingTemplate;

  @Transactional
  public ChatRoomResponse createRoom(CreateRoomRequest request) {
    User creator = getAuthenticatedUser();

    if (creator.isChatAccessRevoked()) {
      throw new ForbiddenException(
          "Your access to chat rooms has been revoked. Contact support if you think this is a"
              + " mistake");
    }

    if (chatRoomRepository.findByMemberId(creator.getId()).isPresent()) {
      throw new ResourceExistsException(
          "You are already in a chat room. Leave it before creating a new one");
    }

    if (chatRoomRepository.hasPendingJoinRequest(creator.getId())) {
      throw new ResourceExistsException(
          "You have a pending request to join a chat room. Cancel it before creating a new one");
    }

    TopicInfo topic = resolveTopic(request.topicType(), request.topicId());
    if (topic == null) {
      throw new ResourceNotFoundException("Chat topic not found");
    }

    ChatRoom room =
        ChatRoom.builder()
            .name(request.name())
            .topicType(request.topicType())
            .topicId(request.topicId())
            .creator(creator)
            .createdAt(LocalDateTime.now())
            .maxCapacity(MAX_CAPACITY)
            .approvalRequired(request.approvalRequired())
            .build();

    room.getMembers().add(creator);

    return toResponse(chatRoomRepository.save(room), creator);
  }

  @Transactional(readOnly = true)
  public List<ChatRoomResponse> getRooms() {
    User user = getAuthenticatedUser();
    return chatRoomRepository.findAll().stream()
        .sorted(Comparator.comparing(ChatRoom::getCreatedAt).reversed())
        .map(room -> toResponse(room, user))
        .toList();
  }

  @Transactional(readOnly = true)
  public ChatRoomResponse getRoomById(Long roomId) {
    return toResponse(findRoomWithMembers(roomId), getAuthenticatedUser());
  }

  /** Maps already-fetched rooms to responses for the caller - e.g. the home feed's room picks. */
  @Transactional(readOnly = true)
  public List<ChatRoomResponse> toResponses(List<ChatRoom> rooms) {
    User user = getAuthenticatedUser();
    return rooms.stream().map(room -> toResponse(room, user)).toList();
  }

  /** The room the caller is currently a member of - 404 when they are not in any room. */
  @Transactional(readOnly = true)
  public ChatRoomResponse getMyRoom() {
    User user = getAuthenticatedUser();
    ChatRoom room =
        chatRoomRepository
            .findByMemberId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("You are not in a chat room"));
    return toResponse(room, user);
  }

  /**
   * Joins the room, or files a join request when the room requires approval and the caller was not
   * invited. An invite (from any member) always lets the user in directly.
   */
  @Transactional
  public JoinRoomResponse joinRoom(Long roomId) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (room.getMembers().contains(user)) {
      notificationService.clearChatRoomNotifications(user, roomId);
      return new JoinRoomResponse(JoinStatus.JOINED, toResponse(room, user));
    }

    if (user.isChatAccessRevoked()) {
      throw new ForbiddenException(
          "Your access to chat rooms has been revoked. Contact support if you think this is a"
              + " mistake");
    }

    chatRoomRepository
        .findByMemberId(user.getId())
        .ifPresent(
            other -> {
              throw new ResourceExistsException(
                  "You are already in another chat room. Leave it first");
            });

    if (chatRoomRepository.hasPendingJoinRequestElsewhere(user.getId(), roomId)) {
      throw new ResourceExistsException(
          "You already have a pending request to join another chat room");
    }

    // Moderators can always get in to investigate
    boolean isModeratorEntry = user.getRole() == UserRole.ADMIN;

    if (!isModeratorEntry && room.getMembers().size() >= room.getMaxCapacity()) {
      throw new ChatRoomFullException("Chat room is at full capacity");
    }

    boolean invited = room.getInvitedUsers().remove(user);

    if (room.isApprovalRequired() && !invited && !isModeratorEntry) {
      if (room.getJoinRequests().add(user)) {
        chatRoomRepository.save(room);
        broadcastEvent(roomId, ChatRoomEventResponse.joinRequest(toSummary(user)));
      }
      return new JoinRoomResponse(JoinStatus.REQUESTED, toResponse(room, user));
    }

    room.getJoinRequests().remove(user);
    room.getMembers().add(user);
    chatRoomRepository.save(room);

    broadcastSystemMessage(room, user, MessageType.JOIN, user.getUsername() + " joined the room");
    notificationService.clearChatRoomNotifications(user, roomId);

    if (isModeratorEntry) {
      markReportHandling(roomId, user);
    }

    return new JoinRoomResponse(JoinStatus.JOINED, toResponse(room, user));
  }

  /** Leaving as a member broadcasts a LEAVE message; leaving as the owner closes the room. */
  @Transactional
  public void leaveRoom(Long roomId) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (room.getCreator().getId().equals(user.getId())) {
      closeRoom(room);
      return;
    }

    if (room.getMembers().remove(user)) {
      chatRoomRepository.save(room);
      broadcastSystemMessage(room, user, MessageType.LEAVE, user.getUsername() + " left the room");
    }
  }

  /** Owner-only: removes a member and broadcasts a KICK message the kicked client reacts to. */
  @Transactional
  public void kickMember(Long roomId, Long targetUserId) {
    User owner = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!room.getCreator().getId().equals(owner.getId())) {
      throw new ForbiddenException("Only the room owner can remove members");
    }
    if (owner.getId().equals(targetUserId)) {
      throw new ForbiddenException("The owner cannot kick themselves - leave to close the room");
    }

    User target = findUserById(targetUserId);

    if (!room.getMembers().remove(target)) {
      throw new ResourceNotFoundException("User is not a member of this room");
    }

    room.getInvitedUsers().remove(target);
    chatRoomRepository.save(room);

    broadcastSystemMessage(
        room, target, MessageType.KICK, target.getUsername() + " was removed from the room");
  }

  /** Any member can invite; the invited user gets a CHAT_INVITE notification. */
  @Transactional
  public void inviteUser(Long roomId, Long targetUserId) {
    User inviter = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!room.getMembers().contains(inviter)) {
      throw new ForbiddenException("Only room members can send invites");
    }

    User target = findUserById(targetUserId);

    if (room.getMembers().contains(target)) {
      throw new ResourceExistsException("User is already a member of this room");
    }

    room.getInvitedUsers().add(target);
    chatRoomRepository.save(room);

    notificationService.notify(
        target, inviter, NotificationType.CHAT_INVITE, room.getId(), room.getName());
  }

  /**
   * Owner-only: turns a pending join request into a membership and notifies the requester via a
   * CHAT_REQUEST_APPROVED notification (their waiting panel also polls membership). The 409 paths
   * must not roll back - the stale request should stay consumed even when approval fails.
   */
  @Transactional(noRollbackFor = {ResourceExistsException.class, ChatRoomFullException.class})
  public void approveRequest(Long roomId, Long targetUserId) {
    User owner = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    requireOwner(room, owner);

    User target = findUserById(targetUserId);

    if (!room.getJoinRequests().contains(target)) {
      throw new ResourceNotFoundException("No pending join request from this user");
    }

    if (chatRoomRepository.findByMemberId(target.getId()).isPresent()) {
      room.getJoinRequests().remove(target);
      chatRoomRepository.save(room);
      broadcastEvent(roomId, ChatRoomEventResponse.requestHandled(targetUserId));
      throw new ResourceExistsException("User has already joined another chat room");
    }

    if (room.getMembers().size() >= room.getMaxCapacity()) {
      throw new ChatRoomFullException("Chat room is at full capacity");
    }

    room.getJoinRequests().remove(target);
    room.getMembers().add(target);
    chatRoomRepository.save(room);

    broadcastSystemMessage(
        room, target, MessageType.JOIN, target.getUsername() + " joined the room");
    broadcastEvent(roomId, ChatRoomEventResponse.requestHandled(targetUserId));

    notificationService.notify(
        target, owner, NotificationType.CHAT_REQUEST_APPROVED, room.getId(), room.getName());
  }

  /**
   * Drops a pending join request. The owner declines others; a requester may also cancel their own
   * pending request (targetUserId == caller).
   */
  @Transactional
  public void declineRequest(Long roomId, Long targetUserId) {
    User caller = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!caller.getId().equals(targetUserId)) {
      requireOwner(room, caller);
    }

    User target = findUserById(targetUserId);

    if (room.getJoinRequests().remove(target)) {
      chatRoomRepository.save(room);
      broadcastEvent(roomId, ChatRoomEventResponse.requestHandled(targetUserId));
    }
  }

  @Transactional(readOnly = true)
  public PagedResponse<ChatMessageResponse> getRoomHistory(Long roomId, int page, int size) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!room.getMembers().contains(user)) {
      throw new ForbiddenException("Only room members can read the chat history");
    }

    Page<ChatMessage> messagePage =
        chatMessageRepository.findByRoomIdOrderBySentAtDesc(roomId, PageRequest.of(page, size));

    List<ChatMessageResponse> content =
        messagePage.getContent().stream().map(this::toMessageResponse).toList();

    return new PagedResponse<>(
        content, page, size, messagePage.getTotalElements(), messagePage.getTotalPages());
  }

  /** Persists and returns a member's chat message; called from the STOMP send handler. */
  @Transactional
  public ChatMessageResponse processMessage(
      Long roomId, SendMessagePayload payload, String senderEmail) {
    ChatRoom room = findRoomWithMembers(roomId);
    User sender = findUserByEmail(senderEmail);

    if (!room.getMembers().contains(sender)) {
      throw new ForbiddenException("Only room members can send messages");
    }

    ChatMessage message =
        ChatMessage.builder()
            .room(room)
            .sender(sender)
            .content(payload.content())
            .sentAt(LocalDateTime.now())
            .messageType(MessageType.TEXT)
            .build();

    return toMessageResponse(chatMessageRepository.save(message));
  }

  @Transactional(readOnly = true)
  public boolean isMember(Long roomId, String email) {
    return chatRoomRepository
        .findWithMembersById(roomId)
        .map(room -> room.getMembers().stream().anyMatch(m -> m.getEmail().equals(email)))
        .orElse(false);
  }

  /**
   * Invoked when a user's last WebSocket session for a room stayed dead past the grace period:
   * treated exactly like an explicit leave (so an owner going away closes the room).
   */
  @Transactional
  public void handleDeparture(String email, Long roomId) {
    ChatRoom room = chatRoomRepository.findWithMembersById(roomId).orElse(null);
    if (room == null) {
      return;
    }

    User user = userRepository.findByEmail(email).orElse(null);
    if (user == null || !room.getMembers().contains(user)) {
      return;
    }

    if (room.getCreator().getId().equals(user.getId())) {
      closeRoom(room);
      return;
    }

    room.getMembers().remove(user);
    chatRoomRepository.save(room);
    broadcastSystemMessage(room, user, MessageType.LEAVE, user.getUsername() + " left the room");
  }

  /**
   * Broadcasts ROOM_CLOSED, then deletes the room's messages and the room itself. Any report still
   * open against this room is auto-resolved
   */
  private void closeRoom(ChatRoom room) {
    broadcastEvent(room.getId(), ChatRoomEventResponse.roomClosed());
    chatMessageRepository.deleteByRoomId(room.getId());
    chatRoomRepository.delete(room);

    chatRoomReportRepository
        .findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(room.getId(), ChatReportStatus.RESOLVED)
        .ifPresent(
            report -> {
              report.setStatus(ChatReportStatus.RESOLVED);
              report.setResolution(ChatReportResolution.DISMISSED);
              report.setResolvedAt(LocalDateTime.now());
              chatRoomReportRepository.save(report);
            });
  }

  /**
   * Snapshots the room's last {@value #REPORT_CONTEXT_MESSAGE_COUNT} messages into a new report for
   * admins to review
   */
  @Transactional
  public void reportRoom(Long roomId, ChatReportCategory category) {
    User reporter = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!room.getMembers().contains(reporter)) {
      throw new ForbiddenException("Only room members can report this room");
    }

    ChatRoomReport report =
        ChatRoomReport.builder()
            .reporter(reporter)
            .roomId(roomId)
            .roomName(room.getName())
            .topicName(resolveTopicName(room))
            .category(category)
            .status(ChatReportStatus.OPEN)
            .build();
    chatRoomReportRepository.save(report);

    saveContextMessages(report);
  }

  @Transactional
  public void adminDeleteRoom(Long roomId) {
    User admin = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    ChatRoomReport report =
        chatRoomReportRepository
            .findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(roomId, ChatReportStatus.RESOLVED)
            .orElseGet(
                () ->
                    ChatRoomReport.builder()
                        .roomId(roomId)
                        .roomName(room.getName())
                        .topicName(resolveTopicName(room))
                        .category(ChatReportCategory.ADMIN_ACTION)
                        .status(ChatReportStatus.OPEN)
                        .build());

    boolean isNewReport = report.getId() == null;

    report.setStatus(ChatReportStatus.RESOLVED);
    report.setResolution(ChatReportResolution.ROOM_DELETED);
    report.setResolvedBy(admin);
    report.setResolvedAt(LocalDateTime.now());
    chatRoomReportRepository.save(report);

    if (isNewReport) {
      saveContextMessages(report);
    }

    closeRoom(room);
  }

  @Transactional
  public void forceCloseRoomsCreatedBy(Long userId) {
    for (ChatRoom room : chatRoomRepository.findByCreatorId(userId)) {
      closeRoom(room);
    }
  }

  private void markReportHandling(Long roomId, User admin) {
    chatRoomReportRepository
        .findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(roomId, ChatReportStatus.RESOLVED)
        .ifPresent(
            report -> {
              report.setStatus(ChatReportStatus.HANDLING);
              report.setHandledBy(admin);
              chatRoomReportRepository.save(report);
            });
  }

  private void saveContextMessages(ChatRoomReport report) {
    Page<ChatMessage> recent =
        chatMessageRepository.findByRoomIdOrderBySentAtDesc(
            report.getRoomId(), PageRequest.of(0, REPORT_CONTEXT_MESSAGE_COUNT));

    List<ChatMessage> chronological = recent.getContent().reversed();

    List<ChatReportMessage> snapshots =
        chronological.stream()
            .map(
                m ->
                    ChatReportMessage.builder()
                        .report(report)
                        .senderUsername(m.getSender().getUsername())
                        .content(m.getContent())
                        .sentAt(m.getSentAt())
                        .build())
            .toList();

    chatReportMessageRepository.saveAll(snapshots);
  }

  private String resolveTopicName(ChatRoom room) {
    TopicInfo topic = resolveTopic(room.getTopicType(), room.getTopicId());
    return topic != null ? topic.name() : null;
  }

  private void requireOwner(ChatRoom room, User user) {
    if (!room.getCreator().getId().equals(user.getId())) {
      throw new ForbiddenException("Only the room owner can manage join requests");
    }
  }

  private void broadcastSystemMessage(
      ChatRoom room, User subject, MessageType type, String content) {
    ChatMessage message =
        ChatMessage.builder()
            .room(room)
            .sender(subject)
            .content(content)
            .sentAt(LocalDateTime.now())
            .messageType(type)
            .build();

    ChatMessageResponse response = toMessageResponse(chatMessageRepository.save(message));
    messagingTemplate.convertAndSend("/topic/chat/" + room.getId(), response);
  }

  private void broadcastEvent(Long roomId, ChatRoomEventResponse event) {
    messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/events", event);
  }

  private ChatRoom findRoomWithMembers(Long roomId) {
    return chatRoomRepository
        .findWithMembersById(roomId)
        .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));
  }

  private ChatRoomResponse toResponse(ChatRoom room, User currentUser) {
    User creator = room.getCreator();
    boolean isOwner = creator.getId().equals(currentUser.getId());

    List<UserSummary> members =
        room.getMembers().stream()
            .sorted(
                Comparator.comparing((User m) -> !m.getId().equals(creator.getId()))
                    .thenComparing(User::getUsername, String.CASE_INSENSITIVE_ORDER))
            .map(this::toSummary)
            .toList();

    MemberStatus myStatus;
    if (isOwner) {
      myStatus = MemberStatus.OWNER;
    } else if (room.getMembers().contains(currentUser)) {
      myStatus = MemberStatus.MEMBER;
    } else if (room.getJoinRequests().contains(currentUser)) {
      myStatus = MemberStatus.PENDING;
    } else {
      myStatus = MemberStatus.NONE;
    }

    List<UserSummary> pendingRequests =
        isOwner ? room.getJoinRequests().stream().map(this::toSummary).toList() : List.of();

    TopicInfo topic = resolveTopic(room.getTopicType(), room.getTopicId());

    return new ChatRoomResponse(
        room.getId(),
        room.getName(),
        room.getTopicType(),
        room.getTopicId(),
        topic != null ? topic.name() : null,
        topic != null ? topic.imageUrl() : null,
        toSummary(creator),
        room.getCreatedAt(),
        room.isApprovalRequired(),
        room.getMaxCapacity(),
        room.getMembers().size(),
        members,
        myStatus,
        pendingRequests);
  }

  /** Resolves the display name and image filename for the room's topic entity */
  private TopicInfo resolveTopic(TopicType type, Long topicId) {
    switch (type) {
      case ALBUM -> {
        Album album = albumRepository.findById(topicId).orElse(null);
        return album != null ? new TopicInfo(album.getTitle(), album.getCoverUrl()) : null;
      }
      case ARTIST -> {
        Artist artist = artistRepository.findById(topicId).orElse(null);
        return artist != null ? new TopicInfo(artist.getArtistName(), artist.getArtistPic()) : null;
      }
      default -> {
        return null;
      }
    }
  }

  private record TopicInfo(String name, String imageUrl) {}

  private UserSummary toSummary(User user) {
    return new UserSummary(user.getId(), user.getUsername(), user.getProfilePicture());
  }

  private ChatMessageResponse toMessageResponse(ChatMessage message) {
    User sender = message.getSender();
    return new ChatMessageResponse(
        message.getId(),
        message.getRoom().getId(),
        sender.getId(),
        sender.getUsername(),
        sender.getProfilePicture(),
        message.getContent(),
        message.getSentAt(),
        message.getMessageType());
  }

  private User getAuthenticatedUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return findUserByEmail(auth.getName());
  }

  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private User findUserById(Long userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
