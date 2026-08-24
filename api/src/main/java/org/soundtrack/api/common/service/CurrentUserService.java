package org.soundtrack.api.common.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserService {

  private final UserRepository userRepository;

  public User getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(authentication.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  public Long getAuthenticatedUserIdOrNull() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getName())) {
      return null;
    }

    return userRepository.findByEmail(authentication.getName()).map(User::getId).orElse(null);
  }
}
