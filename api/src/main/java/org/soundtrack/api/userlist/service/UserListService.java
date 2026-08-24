package org.soundtrack.api.userlist.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.userlist.dto.CreateUserListRequest;
import org.soundtrack.api.userlist.dto.UserListDetailResponse;
import org.soundtrack.api.userlist.dto.UserListSummaryResponse;
import org.soundtrack.api.userlist.mapper.UserListMapper;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserList;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.UserListRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserListService {

  private final UserListRepository userListRepository;
  private final UserRepository userRepository;
  private final AlbumRepository albumRepository;
  private final FavoriteAlbumRepository favoriteAlbumRepository;
  private final UserListMapper userListMapper;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public PagedResponse<UserListSummaryResponse> getMyLists(int page, int size, Long albumId) {
    User user = currentUserService.getAuthenticatedUser();

    Page<UserList> listPage =
        userListRepository.findByOwnerId(
            user.getId(), PageRequest.of(page, size, Sort.by("id").ascending()));

    Set<Long> listIdsContainingAlbum =
        albumId != null
            ? userListRepository.findListIdsByOwnerIdContainingAlbum(user.getId(), albumId)
            : Set.of();

    List<UserListSummaryResponse> content =
        listPage.getContent().stream()
            .map(list -> userListMapper.toSummary(list, listIdsContainingAlbum))
            .toList();

    return new PagedResponse<>(
        content, page, size, listPage.getTotalElements(), listPage.getTotalPages());
  }

  @Transactional(readOnly = true)
  public PagedResponse<UserListSummaryResponse> getUserLists(Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found with id: " + userId);
    }

    Page<UserList> listPage =
        userListRepository.findByOwnerId(
            userId, PageRequest.of(page, size, Sort.by("id").ascending()));

    List<UserListSummaryResponse> content =
        listPage.getContent().stream().map(userListMapper::toSummary).toList();

    return new PagedResponse<>(
        content, page, size, listPage.getTotalElements(), listPage.getTotalPages());
  }

  @Transactional(readOnly = true)
  public UserListDetailResponse getListById(Long listId) {
    UserList userList =
        userListRepository
            .findDetailedById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));

    return userListMapper.toDetail(userList, getFavoritedAlbumIds(userList.getAlbums()));
  }

  @Transactional
  public UserListDetailResponse createList(CreateUserListRequest request) {
    User user = currentUserService.getAuthenticatedUser();

    verifyListNameAvailable(user, request);

    UserList userList =
        UserList.builder()
            .name(request.getName())
            .description(request.getDescription())
            .owner(user)
            .build();

    UserList saved = userListRepository.save(userList);
    return userListMapper.toDetail(saved, getFavoritedAlbumIds(saved.getAlbums()));
  }

  @Transactional
  public UserListDetailResponse updateList(Long listId, CreateUserListRequest request) {
    User user = currentUserService.getAuthenticatedUser();

    UserList userList =
        userListRepository
            .findDetailedById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));

    validateOwnership(userList, user);

    userList.setName(request.getName());
    userList.setDescription(request.getDescription());

    return userListMapper.toDetail(userList, getFavoritedAlbumIds(userList.getAlbums()));
  }

  @Transactional
  public void deleteList(Long listId) {
    User user = currentUserService.getAuthenticatedUser();

    UserList userList =
        userListRepository
            .findById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));

    validateOwnership(userList, user);

    userListRepository.delete(userList);
  }

  @Transactional
  public UserListDetailResponse addAlbum(Long listId, Long albumId) {
    User user = currentUserService.getAuthenticatedUser();

    UserList userList =
        userListRepository
            .findDetailedById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));

    validateOwnership(userList, user);

    boolean alreadyPresent = userList.getAlbums().stream().anyMatch(a -> a.getId().equals(albumId));
    if (alreadyPresent) {
      throw new ResourceExistsException("Album is already in this list");
    }

    Album album =
        albumRepository
            .findById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    userList.getAlbums().add(album);

    return userListMapper.toDetail(userList, getFavoritedAlbumIds(userList.getAlbums()));
  }

  @Transactional
  public UserListDetailResponse removeAlbum(Long listId, Long albumId) {
    User user = currentUserService.getAuthenticatedUser();

    UserList userList =
        userListRepository
            .findDetailedById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));

    validateOwnership(userList, user);

    boolean removed = userList.getAlbums().removeIf(a -> a.getId().equals(albumId));
    if (!removed) {
      throw new ResourceNotFoundException("Album not found in this list");
    }

    return userListMapper.toDetail(userList, getFavoritedAlbumIds(userList.getAlbums()));
  }

  private Set<Long> getFavoritedAlbumIds(List<Album> albums) {
    Long userId = currentUserService.getAuthenticatedUserIdOrNull();
    if (userId == null || albums.isEmpty()) {
      return Set.of();
    }

    Set<Long> albumIds = albums.stream().map(Album::getId).collect(Collectors.toSet());
    return favoriteAlbumRepository.findFavoritedAlbumIdsByUserIdAndAlbumIdIn(userId, albumIds);
  }

  private void validateOwnership(UserList userList, User user) {
    if (!userList.getOwner().getId().equals(user.getId())) {
      throw new ForbiddenException("You are not authorized to modify this list");
    }
  }

  private void verifyListNameAvailable(User user, CreateUserListRequest request) {
    String newListName = request.getName();
    if (!user.getLists().stream().filter(l -> newListName.equals(l.getName())).toList().isEmpty()) {
      throw new ResourceExistsException(
          String.format("A list named %s already exists", newListName));
    }
  }
}
