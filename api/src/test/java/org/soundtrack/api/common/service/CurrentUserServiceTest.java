package org.soundtrack.api.common.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class CurrentUserServiceTest {

  @Mock private UserRepository userRepository;

  private CurrentUserService currentUserService;

  @BeforeEach
  void setUp() {
    currentUserService = new CurrentUserService(userRepository);
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  private void authenticateAs(String email) {
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(email, null, List.of()));
  }

  @Test
  void getAuthenticatedUserThrowsWhenNoAccountMatches() {
    authenticateAs("ghost@example.com");
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> currentUserService.getAuthenticatedUser())
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getAuthenticatedUserReturnsTheMatchingAccount() {
    User user = User.builder().id(1L).email("user@example.com").build();
    authenticateAs("user@example.com");
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

    assertThat(currentUserService.getAuthenticatedUser()).isEqualTo(user);
  }

  @Test
  void getAuthenticatedUserIdOrNullReturnsNullWhenUnauthenticated() {
    SecurityContextHolder.getContext().setAuthentication(null);

    assertThat(currentUserService.getAuthenticatedUserIdOrNull()).isNull();
  }

  @Test
  void getAuthenticatedUserIdOrNullReturnsNullForAnonymousUsers() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new AnonymousAuthenticationToken(
                "key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));

    assertThat(currentUserService.getAuthenticatedUserIdOrNull()).isNull();
  }

  @Test
  void getAuthenticatedUserIdOrNullReturnsTheIdForARealSession() {
    User user = User.builder().id(5L).email("user@example.com").build();
    authenticateAs("user@example.com");
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

    assertThat(currentUserService.getAuthenticatedUserIdOrNull()).isEqualTo(5L);
  }
}
