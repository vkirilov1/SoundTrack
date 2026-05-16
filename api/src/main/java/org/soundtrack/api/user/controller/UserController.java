package org.soundtrack.api.user.controller;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.user.dto.UserProfileResponse;
import org.soundtrack.api.user.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @GetMapping("/{id}")
  public UserProfileResponse getUser(@PathVariable Long id) {
    return userService.getById(id);
  }

  @GetMapping("/me")
  public UserProfileResponse me(Authentication authentication) {

    String email = authentication.getName();

    return userService.getByEmail(email);
  }
}
