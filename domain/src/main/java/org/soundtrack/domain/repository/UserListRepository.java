package org.soundtrack.domain.repository;

import java.util.Optional;
import org.soundtrack.domain.model.UserList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserListRepository extends JpaRepository<UserList, Long> {

  Page<UserList> findByOwnerId(Long ownerId, Pageable pageable);

  @EntityGraph(attributePaths = {"albums", "albums.artists", "owner"})
  Optional<UserList> findDetailedById(Long id);
}
