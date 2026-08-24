package org.soundtrack.api.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.common.service.ImageStorageService;
import org.soundtrack.api.user.dto.UpdateProfileRequest;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserFollowRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private UserFollowRepository userFollowRepository;
  @Mock private ImageStorageService imageStorageService;
  @Mock private CurrentUserService currentUserService;

  private UserService userService;

  @BeforeEach
  void setUp() {
    userService =
        new UserService(
            userRepository, userFollowRepository, imageStorageService, currentUserService);
    ReflectionTestUtils.setField(userService, "userPhotoStoragePath", "/photos");
  }

  private User user(long id) {
    return User.builder().id(id).username("user" + id).profilePicture("userDefault.png").build();
  }

  @Test
  void getByIdThrowsWhenMissing() {
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userService.getById(1L)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void anonymousViewerNeverSeesFollowedFlags() {
    when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    UserProfileResponse response = userService.getById(1L);

    assertThat(response.followed()).isFalse();
    assertThat(response.followsYou()).isFalse();
    verify(userFollowRepository, never()).existsByFollowerIdAndFollowingId(any(), any());
  }

  @Test
  void viewingOwnProfileSkipsFollowLookups() {
    when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(1L);

    UserProfileResponse response = userService.getById(1L);

    assertThat(response.followed()).isFalse();
    assertThat(response.followsYou()).isFalse();
    verify(userFollowRepository, never()).existsByFollowerIdAndFollowingId(any(), any());
  }

  @Test
  void viewingSomeoneElseChecksBothFollowDirections() {
    when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(2L);
    when(userFollowRepository.existsByFollowerIdAndFollowingId(2L, 1L)).thenReturn(true);
    when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);

    UserProfileResponse response = userService.getById(1L);

    assertThat(response.followed()).isTrue();
    assertThat(response.followsYou()).isFalse();
  }

  @Test
  void updateProfileRejectsUsernameTakenBySomeoneElse() {
    User existing = user(1L);
    when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existing));
    UpdateProfileRequest request = new UpdateProfileRequest();
    request.setUsername("taken");
    when(userRepository.existsByUsername("taken")).thenReturn(true);

    assertThatThrownBy(() -> userService.updateProfile("a@b.com", request))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void updateProfileAllowsKeepingTheSameUsername() {
    User existing = user(1L);
    when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existing));
    UpdateProfileRequest request = new UpdateProfileRequest();
    request.setUsername("user1");
    request.setBio("  hello  ");
    when(userRepository.save(existing)).thenReturn(existing);

    userService.updateProfile("a@b.com", request);

    verify(userRepository, never()).existsByUsername(any());
    assertThat(existing.getBio()).isEqualTo("hello");
  }

  @Test
  void updatePhotoDeletesThePreviousCustomPhoto() throws IOException {
    User existing = user(1L);
    existing.setProfilePicture("custom.jpg");
    when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existing));
    MultipartFile file = new MockMultipartFile("file", new byte[0]);
    when(imageStorageService.store(file, "/photos", "user-1")).thenReturn("new.jpg");
    when(userRepository.save(existing)).thenReturn(existing);

    userService.updatePhoto("a@b.com", file);

    verify(imageStorageService).deleteIfPresent("custom.jpg", "/photos");
    assertThat(existing.getProfilePicture()).isEqualTo("new.jpg");
  }

  @Test
  void updatePhotoDoesNotDeleteTheDefaultPhoto() throws IOException {
    User existing = user(1L);
    when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existing));
    MultipartFile file = new MockMultipartFile("file", new byte[0]);
    when(imageStorageService.store(file, "/photos", "user-1")).thenReturn("new.jpg");
    when(userRepository.save(existing)).thenReturn(existing);

    userService.updatePhoto("a@b.com", file);

    verify(imageStorageService, never()).deleteIfPresent(any(), any());
  }

  @Test
  void resetPhotoByIdThrowsWhenUserMissing() {
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userService.resetPhotoById(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void resetPhotoClearsTheProfilePicture() throws IOException {
    User existing = user(1L);
    existing.setProfilePicture("custom.jpg");
    when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
    when(userRepository.save(existing)).thenReturn(existing);

    userService.resetPhotoById(1L);

    verify(imageStorageService).deleteIfPresent("custom.jpg", "/photos");
    assertThat(existing.getProfilePicture()).isNull();
  }
}
