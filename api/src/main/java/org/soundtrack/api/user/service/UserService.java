package org.soundtrack.api.user.service;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.user.dto.UpdateProfileRequest;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

  private static final String DEFAULT_PHOTO = "userDefault.png";

  private final UserRepository userRepository;
  private final UserFollowRepository userFollowRepository;
  private final ImageStorageService imageStorageService;

  @Value("${user.photo.storage.path}")
  private String userPhotoStoragePath;

  public UserProfileResponse getById(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

    Long viewerId = getAuthenticatedUserIdOrNull();

    boolean followed =
        viewerId != null
            && !viewerId.equals(id)
            && userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, id);
    boolean followsYou =
        viewerId != null
            && !viewerId.equals(id)
            && userFollowRepository.existsByFollowerIdAndFollowingId(id, viewerId);

    return toProfileResponse(user, followed, followsYou);
  }

  public UserProfileResponse getByEmail(String email) {
    return toProfileResponse(findUserByEmail(email), false, false);
  }

  @Transactional
  public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
    User user = findUserByEmail(email);

    String newUsername = request.getUsername().trim();

    if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
      throw new ResourceExistsException("Username is already taken");
    }

    user.setUsername(newUsername);
    user.setBio(request.getBio() != null ? request.getBio().trim() : null);

    return toProfileResponse(userRepository.save(user), false, false);
  }

  @Transactional
  public UserProfileResponse updatePhoto(String email, MultipartFile file) throws IOException {
    User user = findUserByEmail(email);

    String filename = imageStorageService.store(file, userPhotoStoragePath, "user-" + user.getId());

    deleteStoredPhotoIfCustom(user);

    user.setProfilePicture(filename);

    return toProfileResponse(userRepository.save(user), false, false);
  }

  @Transactional
  public UserProfileResponse resetPhoto(String email) throws IOException {
    return resetPhoto(findUserByEmail(email));
  }

  @Transactional
  public UserProfileResponse resetPhotoById(Long userId) throws IOException {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

    return resetPhoto(user);
  }

  private UserProfileResponse resetPhoto(User user) throws IOException {
    deleteStoredPhotoIfCustom(user);

    user.setProfilePicture(null);

    return toProfileResponse(userRepository.save(user), false, false);
  }

  private void deleteStoredPhotoIfCustom(User user) throws IOException {
    String current = user.getProfilePicture();

    if (current == null || current.equals(DEFAULT_PHOTO)) {
      return;
    }

    imageStorageService.deleteIfPresent(current, userPhotoStoragePath);
  }

  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
        followsYou);
  }

  /**
   * Returns the authenticated user's id, or null if the caller is anonymous. GET /api/users/{id} is
   * open to anonymous visitors but returns real followed/followsYou flags when a real session is
   * present.
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
