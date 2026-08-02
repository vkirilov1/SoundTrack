package org.soundtrack.api.user.service;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.user.dto.UpdateProfileRequest;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

  private static final String DEFAULT_PHOTO = "userDefault.png";

  private final UserRepository userRepository;
  private final ImageStorageService imageStorageService;

  @Value("${user.photo.storage.path}")
  private String userPhotoStoragePath;

  public UserProfileResponse getById(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

    return toProfileResponse(user);
  }

  public UserProfileResponse getByEmail(String email) {
    return toProfileResponse(findUserByEmail(email));
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

    return toProfileResponse(userRepository.save(user));
  }

  @Transactional
  public UserProfileResponse updatePhoto(String email, MultipartFile file) throws IOException {
    User user = findUserByEmail(email);

    String filename = imageStorageService.store(file, userPhotoStoragePath, "user-" + user.getId());

    deleteStoredPhotoIfCustom(user);

    user.setProfilePicture(filename);

    return toProfileResponse(userRepository.save(user));
  }

  @Transactional
  public UserProfileResponse resetPhoto(String email) throws IOException {
    User user = findUserByEmail(email);

    deleteStoredPhotoIfCustom(user);

    user.setProfilePicture(null);

    return toProfileResponse(userRepository.save(user));
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

  private UserProfileResponse toProfileResponse(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getBio(),
        user.getProfilePicture(),
        user.getJoinDate(),
        user.getRole());
  }
}
