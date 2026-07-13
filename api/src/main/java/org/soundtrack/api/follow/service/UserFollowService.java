package org.soundtrack.api.follow.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.user.dto.UserProfileResponse;
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
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetId));

    userFollowRepository.save(UserFollow.builder().follower(me).following(target).build());
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

    List<UserProfileResponse> content =
        followPage.getContent().stream().map(f -> toProfileResponse(f.getFollower())).toList();

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

    List<UserProfileResponse> content =
        followPage.getContent().stream().map(f -> toProfileResponse(f.getFollowing())).toList();

    return new PagedResponse<>(
        content, page, size, followPage.getTotalElements(), followPage.getTotalPages());
  }

  private UserProfileResponse toProfileResponse(User user) {
    return new UserProfileResponse(
        user.getId(), user.getUsername(), user.getBio(), user.getProfilePicture(), user.getJoinDate());
  }

  private User getAuthenticatedUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(auth.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
