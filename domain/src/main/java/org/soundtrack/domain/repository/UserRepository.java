package org.soundtrack.domain.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByEmail(String email);

  boolean existsByUsername(String username);

  List<User> findTop8ByUsernameContainingIgnoreCase(String username);

  List<User> findTop8ByUsernameContainingIgnoreCaseAndRoleNot(String username, UserRole role);

  List<User> findByDeletedAtBefore(LocalDateTime cutoff);
}
