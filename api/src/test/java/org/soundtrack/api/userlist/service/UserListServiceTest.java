package org.soundtrack.api.userlist.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.ForbiddenException;
import org.soundtrack.api.common.exception.ResourceExistsException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.userlist.dto.CreateUserListRequest;
import org.soundtrack.api.userlist.mapper.UserListMapper;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserList;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.FavoriteAlbumRepository;
import org.soundtrack.domain.repository.UserListRepository;
import org.soundtrack.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserListServiceTest {

  @Mock private UserListRepository userListRepository;
  @Mock private UserRepository userRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
  @Mock private UserListMapper userListMapper;
  @Mock private CurrentUserService currentUserService;

  private UserListService userListService;
  private final User owner = User.builder().id(1L).lists(new ArrayList<>()).build();

  @BeforeEach
  void setUp() {
    userListService =
        new UserListService(
            userListRepository,
            userRepository,
            albumRepository,
            favoriteAlbumRepository,
            userListMapper,
            currentUserService);
  }

  private CreateUserListRequest request(String name) {
    CreateUserListRequest request = new CreateUserListRequest();
    request.setName(name);
    request.setDescription(null);
    return request;
  }

  @Test
  void getUserListsRequiresAnExistingUser() {
    when(userRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> userListService.getUserLists(1L, 0, 20))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getListByIdRequiresAnExistingList() {
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userListService.getListById(1L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void createListRejectsADuplicateNameForTheSameUser() {
    UserList existing = UserList.builder().name("Favorites").build();
    User ownerWithList = User.builder().id(1L).lists(List.of(existing)).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(ownerWithList);

    assertThatThrownBy(() -> userListService.createList(request("Favorites")))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void createListSavesANewListForTheCaller() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.save(any(UserList.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    userListService.createList(request("Favorites"));

    verify(userListRepository).save(any(UserList.class));
  }

  @Test
  void updateListRequiresOwnership() {
    User someoneElse = User.builder().id(2L).build();
    UserList list = UserList.builder().id(1L).owner(someoneElse).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.of(list));

    assertThatThrownBy(() -> userListService.updateList(1L, request("New name")))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void deleteListRequiresOwnership() {
    User someoneElse = User.builder().id(2L).build();
    UserList list = UserList.builder().id(1L).owner(someoneElse).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.findById(1L)).thenReturn(Optional.of(list));

    assertThatThrownBy(() -> userListService.deleteList(1L)).isInstanceOf(ForbiddenException.class);
    verify(userListRepository, never()).delete(any());
  }

  @Test
  void addAlbumRejectsOneAlreadyInTheList() {
    Album album = new Album();
    album.setId(9L);
    UserList list =
        UserList.builder().id(1L).owner(owner).albums(new ArrayList<>(List.of(album))).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.of(list));

    assertThatThrownBy(() -> userListService.addAlbum(1L, 9L))
        .isInstanceOf(ResourceExistsException.class);
  }

  @Test
  void addAlbumRequiresAnExistingAlbum() {
    UserList list = UserList.builder().id(1L).owner(owner).albums(new ArrayList<>()).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.of(list));
    when(albumRepository.findById(9L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userListService.addAlbum(1L, 9L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeAlbumRequiresTheAlbumToBeInTheList() {
    UserList list = UserList.builder().id(1L).owner(owner).albums(new ArrayList<>()).build();
    when(currentUserService.getAuthenticatedUser()).thenReturn(owner);
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.of(list));

    assertThatThrownBy(() -> userListService.removeAlbum(1L, 9L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getFavoritedAlbumIdsSkipsLookupForAnonymousCaller() {
    Album album = new Album();
    album.setId(9L);
    UserList list =
        UserList.builder().id(1L).owner(owner).albums(new ArrayList<>(List.of(album))).build();
    when(userListRepository.findDetailedById(1L)).thenReturn(Optional.of(list));
    when(currentUserService.getAuthenticatedUserIdOrNull()).thenReturn(null);

    userListService.getListById(1L);

    verify(favoriteAlbumRepository, never())
        .findFavoritedAlbumIdsByUserIdAndAlbumIdIn(any(), any());
  }
}
