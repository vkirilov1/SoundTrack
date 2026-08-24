package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.AccountDeletionToken;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountDeletionTokenRepository extends JpaRepository<AccountDeletionToken, Long> {

  @EntityGraph(attributePaths = {"user"})
  Optional<AccountDeletionToken> findByTokenHash(String tokenHash);

  void deleteByUserId(Long userId);
}
