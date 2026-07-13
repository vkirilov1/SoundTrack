package org.soundtrack.api.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.dto.ChatMessageResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse.UserSummary;
import org.soundtrack.api.chat.dto.CreateRoomRequest;
import org.soundtrack.api.chat.dto.SendMessagePayload;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ChatRoomFullException;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.ChatMessage;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.MessageType;
import org.soundtrack.domain.model.TopicType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.ChatRoomRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

  private static final int DEFAULT_MAX_CAPACITY = 50;

  private final ChatRoomRepository chatRoomRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final UserRepository userRepository;
  private final ChatRoomStateService stateService;

  @Transactional
  public ChatRoomResponse createRoom(CreateRoomRequest request) {
    User creator = getAuthenticatedUser();

    int capacity =
        (request.maxCapacity() != null) ? request.maxCapacity() : DEFAULT_MAX_CAPACITY;

    ChatRoom room =
        ChatRoom.builder()
            .name(request.name())
            .topicType(request.topicType())
            .topicId(request.topicId())
            .creator(creator)
            .createdAt(LocalDateTime.now())
            .maxCapacity(capacity)
            .build();

    room.getMembers().add(creator);

    return toResponse(chatRoomRepository.save(room));
  }

  @Transactional(readOnly = true)
  public List<ChatRoomResponse> getRooms(TopicType topicType, Long topicId) {
    List<ChatRoom> rooms;

    if (topicType != null && topicId != null) {
      rooms = chatRoomRepository.findByTopicTypeAndTopicId(topicType, topicId);
    } else if (topicType != null) {
      rooms = chatRoomRepository.findByTopicType(topicType);
    } else {
      rooms = chatRoomRepository.findAll();
    }

    return rooms.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public ChatRoomResponse getRoomById(Long roomId) {
    return toResponse(findRoomWithMembers(roomId));
  }

  @Transactional
  public ChatRoomResponse joinRoom(Long roomId) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (room.getMembers().contains(user)) {
      return toResponse(room);
    }

    if (room.getMembers().size() >= room.getMaxCapacity()) {
      throw new ChatRoomFullException("Chat room is at full capacity");
    }

    room.getMembers().add(user);
    return toResponse(chatRoomRepository.save(room));
  }

  @Transactional
  public void leaveRoom(Long roomId) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);
    room.getMembers().remove(user);
    chatRoomRepository.save(room);
  }

  @Transactional
  public ChatRoomResponse deleteRoom(Long roomId) {
    User user = getAuthenticatedUser();
    ChatRoom room = findRoomWithMembers(roomId);

    if (!room.getCreator().getId().equals(user.getId())) {
      throw new ForbiddenException("Only the room creator can delete this room");
    }

    chatRoomRepository.delete(room);
    return toResponse(room);
  }

  @Transactional(readOnly = true)
  public PagedResponse<ChatMessageResponse> getRoomHistory(Long roomId, int page, int size) {
    findRoomWithMembers(roomId);
    Page<ChatMessage> messagePage =
        chatMessageRepository.findByRoomIdOrderBySentAtDesc(
            roomId, PageRequest.of(page, size));

    List<ChatMessageResponse> content =
        messagePage.getContent().stream().map(this::toMessageResponse).toList();

    return new PagedResponse<>(
        content, page, size, messagePage.getTotalElements(), messagePage.getTotalPages());
  }

  @Transactional
  public ChatMessageResponse processMessage(
      Long roomId, SendMessagePayload payload, String senderEmail) {
    ChatRoom room =
        chatRoomRepository
            .findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

    User sender = findUserByEmail(senderEmail);

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

  @Transactional
  public ChatMessageResponse buildSystemMessage(Long roomId, String senderEmail, MessageType type) {
    ChatRoom room =
        chatRoomRepository
            .findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

    User sender = findUserByEmail(senderEmail);
    String action = type == MessageType.JOIN ? " joined the room" : " left the room";

    ChatMessage message =
        ChatMessage.builder()
            .room(room)
            .sender(sender)
            .content(sender.getUsername() + action)
            .sentAt(LocalDateTime.now())
            .messageType(type)
            .build();

    return toMessageResponse(chatMessageRepository.save(message));
  }

  private ChatRoom findRoomWithMembers(Long roomId) {
    return chatRoomRepository
        .findWithMembersById(roomId)
        .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));
  }

  private ChatRoomResponse toResponse(ChatRoom room) {
    User creator = room.getCreator();
    return new ChatRoomResponse(
        room.getId(),
        room.getName(),
        room.getTopicType(),
        room.getTopicId(),
        new UserSummary(creator.getId(), creator.getUsername(), creator.getProfilePicture()),
        room.getCreatedAt(),
        room.getMaxCapacity(),
        room.getMembers().size(),
        stateService.getActiveUserCount(room.getId()));
  }

  private ChatMessageResponse toMessageResponse(ChatMessage message) {
    User sender = message.getSender();
    return new ChatMessageResponse(
        message.getId(),
        message.getRoom().getId(),
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
}
