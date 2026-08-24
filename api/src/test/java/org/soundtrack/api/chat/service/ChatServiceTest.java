package org.soundtrack.api.chat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.chat.dto.ChatRoomResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse.MemberStatus;
import org.soundtrack.api.chat.dto.CreateRoomRequest;
import org.soundtrack.api.chat.dto.JoinRoomResponse;
import org.soundtrack.api.chat.dto.JoinRoomResponse.JoinStatus;
import org.soundtrack.api.chat.dto.SendMessagePayload;
import org.soundtrack.api.common.exception.ChatRoomFullException;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.ChatReportCategory;
import org.soundtrack.domain.model.ChatRoom;
import org.soundtrack.domain.model.ChatRoomReport;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

  @Mock private ChatRoomRepository chatRoomRepository;
  @Mock private ChatMessageRepository chatMessageRepository;
  @Mock private ChatRoomReportRepository chatRoomReportRepository;
  @Mock private ChatReportMessageRepository chatReportMessageRepository;
  @Mock private UserRepository userRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private ArtistRepository artistRepository;
  @Mock private NotificationService notificationService;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private CurrentUserService currentUserService;

  private ChatService chatService;
  private final User owner =
      User.builder()
          .id(1L)
          .username("owner")
          .email("owner@example.com")
          .role(UserRole.USER)
          .build();

  @BeforeEach
  void setUp() {
    chatService =
        new ChatService(
            chatRoomRepository,
            chatMessageRepository,
            chatRoomReportRepository,
            chatReportMessageRepository,
            userRepository,
            albumRepository,
            artistRepository,
            notificationService,
            messagingTemplate,
            currentUserService);
  }

  private ChatRoom room(User creator, int maxCapacity, User... members) {
    ChatRoom room =
        ChatRoom.builder()
            .id(10L)
            .name("room")
            .topicType(TopicType.ALBUM)
            .topicId(1L)
            .creator(creator)
            .maxCapacity(maxCapacity)
            .build();
    room.getMembers().add(creator);
    for (User member : members) {
      room.getMembers().add(member);
    }
    return room;
  }

  private CreateRoomRequest createRoomRequest(boolean approvalRequired) {
    return new CreateRoomRequest("New Room", TopicType.ALBUM, 1L, approvalRequired);
  }

  @Test
  void createRoomRejectsARevokedUser() {
    User revoked = User.builder().id(1L).chatAccessRevoked(true).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(revoked);

    assertThatThrownBy(() -> chatService.createRoom(createRoomRequest(false)))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void createRoomRejectsACallerAlreadyInARoom() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.of(room(owner, 20)));

    assertThatThrownBy(() -> chatService.createRoom(createRoomRequest(false)))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void createRoomRejectsACallerWithAPendingJoinRequest() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequest(1L)).thenReturn(true);

    assertThatThrownBy(() -> chatService.createRoom(createRoomRequest(false)))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void createRoomRequiresAnExistingTopic() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequest(1L)).thenReturn(false);
    when(albumRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> chatService.createRoom(createRoomRequest(false)))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void createRoomMakesTheCreatorTheOwnerAndSoleMember() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequest(1L)).thenReturn(false);
    Album album = new Album();
    album.setId(1L);
    album.setTitle("Album");
    when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
    when(chatRoomRepository.save(any(ChatRoom.class))).thenAnswer(inv -> inv.getArgument(0));

    ChatRoomResponse response = chatService.createRoom(createRoomRequest(false));

    assertThat(response.myStatus()).isEqualTo(MemberStatus.OWNER);
    assertThat(response.memberCount()).isEqualTo(1);
    assertThat(response.topicName()).isEqualTo("Album");
  }

  @Test
  void getMyRoomThrowsWhenNotInARoom() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> chatService.getMyRoom()).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void joinRoomForAnExistingMemberJustClearsNotificationsAndReturnsJoined() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    JoinRoomResponse response = chatService.joinRoom(10L);

    assertThat(response.status()).isEqualTo(JoinStatus.JOINED);
    verify(notificationService).clearChatRoomNotifications(owner, 10L);
    verify(chatRoomRepository, never()).save(any());
  }

  @Test
  void joinRoomRejectsARevokedUser() {
    User revoked = User.builder().id(2L).chatAccessRevoked(true).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(revoked);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.joinRoom(10L)).isInstanceOf(ForbiddenException.class);
  }

  @Test
  void joinRoomRejectsSomeoneAlreadyInAnotherRoom() {
    User joiner = User.builder().id(2L).role(UserRole.USER).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(joiner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L))
        .thenReturn(Optional.of(room(User.builder().id(3L).build(), 20)));

    assertThatThrownBy(() -> chatService.joinRoom(10L)).isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void joinRoomRejectsSomeoneWithAPendingRequestElsewhere() {
    User joiner = User.builder().id(2L).role(UserRole.USER).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(joiner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequestElsewhere(2L, 10L)).thenReturn(true);

    assertThatThrownBy(() -> chatService.joinRoom(10L)).isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void joinRoomRejectsWhenFullForARegularUser() {
    User joiner = User.builder().id(2L).role(UserRole.USER).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(joiner);
    ChatRoom room = room(owner, 1);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequestElsewhere(2L, 10L)).thenReturn(false);

    assertThatThrownBy(() -> chatService.joinRoom(10L)).isInstanceOf(ChatRoomFullException.class);
  }

  @Test
  void joinRoomAllowsAModeratorIntoAFullRoom() {
    User moderator = User.builder().id(2L).username("mod").role(UserRole.ADMIN).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(moderator);
    ChatRoom room = room(owner, 1);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequestElsewhere(2L, 10L)).thenReturn(false);
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    JoinRoomResponse response = chatService.joinRoom(10L);

    assertThat(response.status()).isEqualTo(JoinStatus.JOINED);
    assertThat(room.getMembers()).contains(moderator);
  }

  @Test
  void joinRoomFilesARequestWhenApprovalIsRequiredAndNotInvited() {
    User joiner = User.builder().id(2L).username("joiner").role(UserRole.USER).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(joiner);
    ChatRoom room = room(owner, 20);
    room.setApprovalRequired(true);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequestElsewhere(2L, 10L)).thenReturn(false);

    JoinRoomResponse response = chatService.joinRoom(10L);

    assertThat(response.status()).isEqualTo(JoinStatus.REQUESTED);
    assertThat(room.getJoinRequests()).contains(joiner);
    assertThat(room.getMembers()).doesNotContain(joiner);
  }

  @Test
  void joinRoomLetsAnInvitedUserInDirectlyDespiteApprovalRequirement() {
    User invitee = User.builder().id(2L).username("invitee").role(UserRole.USER).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(invitee);
    ChatRoom room = room(owner, 20);
    room.setApprovalRequired(true);
    room.getInvitedUsers().add(invitee);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequestElsewhere(2L, 10L)).thenReturn(false);
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    JoinRoomResponse response = chatService.joinRoom(10L);

    assertThat(response.status()).isEqualTo(JoinStatus.JOINED);
    assertThat(room.getMembers()).contains(invitee);
  }

  @Test
  void leaveRoomAsOwnerClosesIt() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatRoomReportRepository.findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(any(), any()))
        .thenReturn(Optional.empty());

    chatService.leaveRoom(10L);

    verify(chatMessageRepository).deleteByRoomId(10L);
    verify(chatRoomRepository).delete(room);
  }

  @Test
  void leaveRoomAsMemberJustRemovesThem() {
    User member = User.builder().id(2L).username("member").build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(member);
    ChatRoom room = room(owner, 20, member);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    chatService.leaveRoom(10L);

    assertThat(room.getMembers()).doesNotContain(member);
    verify(chatRoomRepository, never()).delete(any());
  }

  @Test
  void kickMemberRequiresTheCallerToBeOwner() {
    User notOwner = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(notOwner);
    ChatRoom room = room(owner, 20, notOwner);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.kickMember(10L, 3L))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void kickMemberRejectsSelfKick() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.kickMember(10L, 1L))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void kickMemberRequiresTheTargetToBeAMember() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    User target = User.builder().id(2L).build();
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));

    assertThatThrownBy(() -> chatService.kickMember(10L, 2L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void kickMemberRemovesTheMemberAndTheirInvite() {
    User target = User.builder().id(2L).username("target").build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20, target);
    room.getInvitedUsers().add(target);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    chatService.kickMember(10L, 2L);

    assertThat(room.getMembers()).doesNotContain(target);
    assertThat(room.getInvitedUsers()).doesNotContain(target);
  }

  @Test
  void inviteUserRequiresTheInviterToBeAMember() {
    User outsider = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(outsider);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.inviteUser(10L, 3L))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void inviteUserRejectsAnAlreadyPresentTarget() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20, target);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));

    assertThatThrownBy(() -> chatService.inviteUser(10L, 2L))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void inviteUserAddsTheInviteAndNotifies() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));

    chatService.inviteUser(10L, 2L);

    assertThat(room.getInvitedUsers()).contains(target);
    verify(notificationService).notify(target, owner, NotificationType.CHAT_INVITE, 10L, "room");
  }

  @Test
  void approveRequestRequiresAPendingRequestFromTheTarget() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));

    assertThatThrownBy(() -> chatService.approveRequest(10L, 2L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void approveRequestDropsARequesterWhoJoinedElsewhereMeanwhile() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    room.getJoinRequests().add(target);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(chatRoomRepository.findByMemberId(2L))
        .thenReturn(Optional.of(room(User.builder().id(5L).build(), 20)));

    assertThatThrownBy(() -> chatService.approveRequest(10L, 2L))
        .isInstanceOf(ResourceExistsException.class);
    assertThat(room.getJoinRequests()).doesNotContain(target);
  }

  @Test
  void approveRequestRejectsWhenRoomIsFull() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 1);
    room.getJoinRequests().add(target);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> chatService.approveRequest(10L, 2L))
        .isInstanceOf(ChatRoomFullException.class);
  }

  @Test
  void approveRequestAddsTheMemberAndNotifiesThem() {
    User target = User.builder().id(2L).username("target").build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    room.getJoinRequests().add(target);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));
    when(chatRoomRepository.findByMemberId(2L)).thenReturn(Optional.empty());
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    chatService.approveRequest(10L, 2L);

    assertThat(room.getMembers()).contains(target);
    assertThat(room.getJoinRequests()).doesNotContain(target);
    verify(notificationService)
        .notify(target, owner, NotificationType.CHAT_REQUEST_APPROVED, 10L, "room");
  }

  @Test
  void declineRequestAllowsARequesterToCancelTheirOwnRequest() {
    User requester = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(requester);
    ChatRoom room = room(owner, 20);
    room.getJoinRequests().add(requester);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findById(2L)).thenReturn(Optional.of(requester));

    chatService.declineRequest(10L, 2L);

    assertThat(room.getJoinRequests()).doesNotContain(requester);
  }

  @Test
  void declineRequestRejectsAThirdPartyWhoIsNotTheOwner() {
    User requester = User.builder().id(2L).build();
    User thirdParty = User.builder().id(3L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(thirdParty);
    ChatRoom room = room(owner, 20);
    room.getJoinRequests().add(requester);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.declineRequest(10L, 2L))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void getRoomHistoryRequiresMembership() {
    User outsider = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(outsider);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.getRoomHistory(10L, 0, 20))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void processMessageRequiresMembership() {
    User outsider = User.builder().id(2L).email("outsider@example.com").build();
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findByEmail("outsider@example.com")).thenReturn(Optional.of(outsider));

    assertThatThrownBy(
            () ->
                chatService.processMessage(
                    10L, new SendMessagePayload("hi"), "outsider@example.com"))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void processMessageSavesAndReturnsTheMessage() {
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var response =
        chatService.processMessage(10L, new SendMessagePayload("hi"), "owner@example.com");

    assertThat(response.content()).isEqualTo("hi");
    assertThat(response.senderId()).isEqualTo(1L);
  }

  @Test
  void isMemberChecksByEmail() {
    User member = User.builder().id(2L).email("member@example.com").build();
    ChatRoom room = room(owner, 20, member);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThat(chatService.isMember(10L, "member@example.com")).isTrue();
    assertThat(chatService.isMember(10L, "ghost@example.com")).isFalse();
  }

  @Test
  void handleDepartureIsANoOpWhenRoomIsGone() {
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.empty());

    chatService.handleDeparture("owner@example.com", 10L);

    verify(chatRoomRepository, never()).delete(any());
  }

  @Test
  void handleDepartureClosesTheRoomWhenTheOwnerLeaves() {
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
    when(chatRoomReportRepository.findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(any(), any()))
        .thenReturn(Optional.empty());

    chatService.handleDeparture("owner@example.com", 10L);

    verify(chatRoomRepository).delete(room);
  }

  @Test
  void handleDepartureJustRemovesARegularMember() {
    User member = User.builder().id(2L).username("member").email("member@example.com").build();
    ChatRoom room = room(owner, 20, member);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(member));
    when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    chatService.handleDeparture("member@example.com", 10L);

    assertThat(room.getMembers()).doesNotContain(member);
    verify(chatRoomRepository, never()).delete(any());
  }

  @Test
  void reportRoomRequiresMembership() {
    User outsider = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(outsider);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> chatService.reportRoom(10L, ChatReportCategory.SPAM))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void reportRoomSavesAReportAndSnapshotsRecentMessages() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    ChatRoom room = room(owner, 20);
    when(chatRoomRepository.findWithMembersById(10L)).thenReturn(Optional.of(room));
    when(chatMessageRepository.findByRoomIdOrderBySentAtDesc(eq(10L), any()))
        .thenReturn(Page.empty());

    chatService.reportRoom(10L, ChatReportCategory.HARASSMENT);

    verify(chatRoomReportRepository).save(any(ChatRoomReport.class));
    verify(chatReportMessageRepository).saveAll(List.of());
  }

  @Test
  void forceCloseRoomsCreatedByClosesEveryRoomForThatUser() {
    ChatRoom roomOne = room(owner, 20);
    ChatRoom roomTwo =
        ChatRoom.builder()
            .id(11L)
            .name("r2")
            .creator(owner)
            .topicType(TopicType.ARTIST)
            .topicId(2L)
            .build();
    when(chatRoomRepository.findByCreatorId(1L)).thenReturn(List.of(roomOne, roomTwo));
    when(chatRoomReportRepository.findFirstByRoomIdAndStatusNotOrderByCreatedAtDesc(any(), any()))
        .thenReturn(Optional.empty());

    chatService.forceCloseRoomsCreatedBy(1L);

    verify(chatRoomRepository).delete(roomOne);
    verify(chatRoomRepository).delete(roomTwo);
  }

  @Test
  void resolvesArtistTopicName() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(chatRoomRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    when(chatRoomRepository.hasPendingJoinRequest(1L)).thenReturn(false);
    Artist artist = new Artist();
    artist.setId(1L);
    artist.setArtistName("Artist Name");
    when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
    when(chatRoomRepository.save(any(ChatRoom.class))).thenAnswer(inv -> inv.getArgument(0));

    ChatRoomResponse response =
        chatService.createRoom(new CreateRoomRequest("Room", TopicType.ARTIST, 1L, false));

    assertThat(response.topicName()).isEqualTo("Artist Name");
  }
}
