package org.soundtrack.api.follow.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserFollow;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class UserFollowServiceTest {

  @Mock private UserFollowRepository userFollowRepository;
  @Mock private UserRepository userRepository;
  @Mock private NotificationService notificationService;
  @Mock private CurrentUserService currentUserService;

  private UserFollowService userFollowService;
  private final User me = User.builder().id(1L).build();

  @BeforeEach
  void setUp() {
    userFollowService =
        new UserFollowService(
            userFollowRepository, userRepository, notificationService, currentUserService);
  }

  @Test
  void cannotFollowSelf() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(me);

    assertThatThrownBy(() -> userFollowService.follow(1L))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void cannotFollowSomeoneAlreadyFollowed() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(me);
    when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

    assertThatThrownBy(() -> userFollowService.follow(2L))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void followTargetMustExist() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(me);
    when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);
    when(userRepository.findById(2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userFollowService.follow(2L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void followingSavesTheLinkAndNotifiesTheTarget() {
    User target = User.builder().id(2L).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(me);
    when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);
    when(userRepository.findById(2L)).thenReturn(Optional.of(target));

    userFollowService.follow(2L);

    verify(userFollowRepository).save(any(UserFollow.class));
    verify(notificationService).notify(target, me, NotificationType.FOLLOW, 1L, null);
  }

  @Test
  void unfollowRequiresAnExistingFollow() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(me);
    when(userFollowRepository.findByFollowerIdAndFollowingId(1L, 2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userFollowService.unfollow(2L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getFollowersRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> userFollowService.getFollowers(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getFollowingRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> userFollowService.getFollowing(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void anonymousViewerNeverSeesFollowedOrFollowsYouFlags() {
    User rowUser = User.builder().id(3L).build();
    UserFollow row = UserFollow.builder().id(1L).follower(rowUser).build();

    when(userRepository.existsById(2L)).thenReturn(true);
    when(userFollowRepository.findByFollowingId(any(), any()))
        .thenReturn(new PageImpl<>(List.of(row)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    PagedResponse<UserProfileResponse> response = userFollowService.getFollowers(2L, 0, 20);

    assertThat(response.content()).hasSize(1);
    assertThat(response.content().get(0).followed()).isFalse();
    assertThat(response.content().get(0).followsYou()).isFalse();
    verify(userFollowRepository, never())
        .findFollowingIdsByFollowerIdAndFollowingIdIn(any(), any());
  }

  @Test
  void authenticatedViewerGetsFollowedAndFollowsYouFlagsFromBatchLookups() {
    User rowUser = User.builder().id(3L).build();
    UserFollow row = UserFollow.builder().id(1L).following(rowUser).build();

    when(userRepository.existsById(2L)).thenReturn(true);
    when(userFollowRepository.findByFollowerId(any(), any()))
        .thenReturn(new PageImpl<>(List.of(row)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(7L);
    when(userFollowRepository.findFollowingIdsByFollowerIdAndFollowingIdIn(7L, Set.of(3L)))
        .thenReturn(Set.of(3L));
    when(userFollowRepository.findFollowerIdsByFollowingIdAndFollowerIdIn(7L, Set.of(3L)))
        .thenReturn(Set.of());

    PagedResponse<UserProfileResponse> response = userFollowService.getFollowing(2L, 0, 20);

    assertThat(response.content().get(0).followed()).isTrue();
    assertThat(response.content().get(0).followsYou()).isFalse();
  }
}
