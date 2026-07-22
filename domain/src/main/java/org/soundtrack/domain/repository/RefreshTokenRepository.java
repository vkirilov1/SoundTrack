package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  Optional<RefreshToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query("update RefreshToken r set r.revoked = true where r.user.id = :userId and r.revoked = false")
  void revokeAllForUser(@Param("userId") Long userId);
}
