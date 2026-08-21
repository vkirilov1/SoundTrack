package org.soundtrack.api.follow.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserFollow;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserFollowService {

  private final UserFollowRepository userFollowRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  @Transactional
  public void follow(Long targetId) {
    User me = getAuthenticatedUser();

    if (me.getId().equals(targetId)) {
      throw new InvalidOperationException("You cannot follow yourself");
    }

    if (userFollowRepository.existsByFollowerIdAndFollowingId(me.getId(), targetId)) {
      throw new ResourceExistsException("You are already following this user");
    }

    User target =
        userRepository
            .findById(targetId)
            .orElseThrow(
                () -> new ResourceNotFoundException("User not found with id: " + targetId));

    userFollowRepository.save(UserFollow.builder().follower(me).following(target).build());

    notificationService.notify(target, me, NotificationType.FOLLOW, me.getId(), null);
  }

  @Transactional
  public void unfollow(Long targetId) {
    User me = getAuthenticatedUser();

    UserFollow follow =
        userFollowRepository
            .findByFollowerIdAndFollowingId(me.getId(), targetId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not following this user"));

    userFollowRepository.delete(follow);
  }

  @Transactional(readOnly = true)
  public PagedResponse<UserProfileResponse> getFollowers(Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }

    Page<UserFollow> followPage =
        userFollowRepository.findByFollowingId(
            userId, PageRequest.of(page, size, Sort.by("followedAt").descending()));

    List<User> rowUsers = followPage.getContent().stream().map(UserFollow::getFollower).toList();

    List<UserProfileResponse> content = toProfileResponses(rowUsers);

    return new PagedResponse<>(
        content, page, size, followPage.getTotalElements(), followPage.getTotalPages());
  }

  @Transactional(readOnly = true)
  public PagedResponse<UserProfileResponse> getFollowing(Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }

    Page<UserFollow> followPage =
        userFollowRepository.findByFollowerId(
            userId, PageRequest.of(page, size, Sort.by("followedAt").descending()));

    List<User> rowUsers = followPage.getContent().stream().map(UserFollow::getFollowing).toList();

    List<UserProfileResponse> content = toProfileResponses(rowUsers);

    return new PagedResponse<>(
        content, page, size, followPage.getTotalElements(), followPage.getTotalPages());
  }

  /**
   * Maps a page's worth of users to profile responses, batch-computing "followed"/"followsYou"
   * relative to the current viewer (both false for anonymous viewers) in two queries total instead
   * of two per row.
   */
  private List<UserProfileResponse> toProfileResponses(List<User> users) {
    Long viewerId = getAuthenticatedUserIdOrNull();

    Set<Long> rowIds = users.stream().map(User::getId).collect(Collectors.toSet());

    Set<Long> followedIds =
        viewerId != null && !rowIds.isEmpty()
            ? userFollowRepository.findFollowingIdsByFollowerIdAndFollowingIdIn(viewerId, rowIds)
            : Set.of();
    Set<Long> followsYouIds =
        viewerId != null && !rowIds.isEmpty()
            ? userFollowRepository.findFollowerIdsByFollowingIdAndFollowerIdIn(viewerId, rowIds)
            : Set.of();

    return users.stream()
        .map(
            user ->
                toProfileResponse(
                    user, followedIds.contains(user.getId()), followsYouIds.contains(user.getId())))
        .toList();
  }

  private UserProfileResponse toProfileResponse(User user, boolean followed, boolean followsYou) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getBio(),
        user.getProfilePicture(),
        user.getJoinDate(),
        user.getRole(),
        followed,
        followsYou,
        user.isChatAccessRevoked());
  }

  private User getAuthenticatedUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(auth.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. Followers/following
   * lists are open to anonymous visitors but return real followed/followsYou flags per row when a
   * real session is present.
   *
   * @return the current user's id, or null if not authenticated
   */
  private Long getAuthenticatedUserIdOrNull() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getName())) {
      return null;
    }

    return userRepository.findByEmail(authentication.getName()).map(User::getId).orElse(null);
  }
}
