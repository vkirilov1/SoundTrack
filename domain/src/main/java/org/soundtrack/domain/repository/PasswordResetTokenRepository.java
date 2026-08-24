package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.PasswordResetToken;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

  @EntityGraph(attributePaths = {"user"})
  Optional<PasswordResetToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query(
      "update PasswordResetToken t set t.used = true where t.user.id = :userId and t.used = false")
  void invalidateAllForUser(@Param("userId") Long userId);

  void deleteByUserId(Long userId);
}
