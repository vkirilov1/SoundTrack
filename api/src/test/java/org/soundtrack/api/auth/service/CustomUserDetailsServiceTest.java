package org.soundtrack.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

  @Mock private UserRepository userRepository;

  private CustomUserDetailsService service;

  @BeforeEach
  void setUp() {
    service = new CustomUserDetailsService(userRepository);
  }

  @Test
  void throwsWhenNoUserHasThatEmail() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.loadUserByUsername("ghost@example.com"))
        .isInstanceOf(UsernameNotFoundException.class);
  }

  @Test
  void mapsRoleToASpringSecurityAuthority() {
    User user =
        User.builder().email("admin@example.com").password("hashed").role(UserRole.ADMIN).build();
    when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));

    UserDetails details = service.loadUserByUsername("admin@example.com");

    assertThat(details.getUsername()).isEqualTo("admin@example.com");
    assertThat(details.getPassword()).isEqualTo("hashed");
    assertThat(details.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
  }
}
