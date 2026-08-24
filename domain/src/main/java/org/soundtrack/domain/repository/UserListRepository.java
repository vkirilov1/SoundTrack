package org.soundtrack.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.soundtrack.domain.model.UserList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserListRepository extends JpaRepository<UserList, Long> {

  Page<UserList> findByOwnerId(Long ownerId, Pageable pageable);

  @Query(
      "SELECT ul.id FROM UserList ul JOIN ul.albums a "
          + "WHERE ul.owner.id = :ownerId AND a.id = :albumId")
  Set<Long> findListIdsByOwnerIdContainingAlbum(
      @Param("ownerId") Long ownerId, @Param("albumId") Long albumId);

  @EntityGraph(attributePaths = {"albums", "owner"})
  Optional<UserList> findDetailedById(Long id);

  @Query("SELECT DISTINCT a.id FROM UserList ul JOIN ul.albums a WHERE ul.owner.id = :ownerId")
  List<Long> findAlbumIdsByOwnerId(@Param("ownerId") Long ownerId);
}
