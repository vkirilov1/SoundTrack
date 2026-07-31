package org.soundtrack.domain.repository;

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

  // Deliberately NOT joining "albums.artists" here: fetching two collections in one query
  // (albums + albums.artists) produces one SQL row per (album, artist) pair, and since
  // `albums` is a List (not a Set), Hibernate doesn't dedupe the resulting rows - an album
  // with 2+ artists ends up duplicated in the in-memory list, which then causes duplicate-key
  // violations when the list is later flushed. Artist names are still available lazily,
  // within the same transaction, via UserListMapper.
  @EntityGraph(attributePaths = {"albums", "owner"})
  Optional<UserList> findDetailedById(Long id);
}
