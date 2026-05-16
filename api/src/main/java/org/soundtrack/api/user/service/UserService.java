package org.soundtrack.api.user.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;

  public UserProfileResponse getById(Long id) {

    User user = userRepository.findById(id).orElseThrow();

    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getBio(),
        user.getProfilePicture(),
        user.getJoinDate());
  }

  public UserProfileResponse getByEmail(String email) {
    User user = userRepository.findByEmail(email).orElseThrow();

    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getBio(),
        user.getProfilePicture(),
        user.getJoinDate());
  }
}
