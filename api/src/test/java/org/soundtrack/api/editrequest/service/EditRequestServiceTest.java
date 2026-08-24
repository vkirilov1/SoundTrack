package org.soundtrack.api.editrequest.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.editrequest.dto.EditRequestResponse;
import org.soundtrack.api.editrequest.mapper.EditRequestMapper;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.Album;
import org.soundtrack.domain.model.Artist;
import org.soundtrack.domain.model.EditRequest;
import org.soundtrack.domain.model.EditRequestStatus;
import org.soundtrack.domain.model.EditRequestTargetType;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumRepository;
import org.soundtrack.domain.repository.ArtistRepository;
import org.soundtrack.domain.repository.EditRequestRepository;
import org.soundtrack.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class EditRequestServiceTest {

  @Mock private EditRequestRepository editRequestRepository;
  @Mock private AlbumRepository albumRepository;
  @Mock private ArtistRepository artistRepository;
  @Mock private UserRepository userRepository;
  @Mock private EditRequestMapper editRequestMapper;
  @Mock private NotificationService notificationService;

  private EditRequestService editRequestService;
  private final User admin = User.builder().id(1L).username("admin").build();
  private final User requester = User.builder().id(2L).username("requester").build();

  @BeforeEach
  void setUp() {
    editRequestService =
        new EditRequestService(
            editRequestRepository,
            albumRepository,
            artistRepository,
            userRepository,
            editRequestMapper,
            notificationService);
  }

  private EditRequest pendingAlbumRequest() {
    EditRequest request = new EditRequest();
    request.setId(1L);
    request.setTargetType(EditRequestTargetType.ALBUM);
    request.setTargetId(9L);
    request.setRequestedBy(requester);
    request.setProposedDescription("New description");
    request.setStatus(EditRequestStatus.PENDING);
    return request;
  }

  @Test
  void submitAlbumDescriptionRequestRequiresAnExistingAlbum() {
    when(albumRepository.findById(9L)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> editRequestService.submitAlbumDescriptionRequest(9L, "desc", "a@b.com"))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void submitAlbumDescriptionRequestTrimsAndSaves() {
    Album album = new Album();
    album.setId(9L);
    when(albumRepository.findById(9L)).thenReturn(Optional.of(album));
    when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(requester));

    editRequestService.submitAlbumDescriptionRequest(9L, "  new desc  ", "a@b.com");

    org.mockito.ArgumentCaptor<EditRequest> captor =
        org.mockito.ArgumentCaptor.forClass(EditRequest.class);
    verify(editRequestRepository).save(captor.capture());
    assertThat(captor.getValue().getProposedDescription()).isEqualTo("new desc");
    assertThat(captor.getValue().getTargetType()).isEqualTo(EditRequestTargetType.ALBUM);
  }

  @Test
  void approveRejectsARequestThatWasAlreadyReviewed() {
    EditRequest request = pendingAlbumRequest();
    request.setStatus(EditRequestStatus.APPROVED);
    when(editRequestRepository.findById(1L)).thenReturn(Optional.of(request));

    assertThatThrownBy(() -> editRequestService.approve(1L, "admin@b.com"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void approveAppliesTheProposedDescriptionToTheAlbum() {
    EditRequest request = pendingAlbumRequest();
    Album album = new Album();
    album.setId(9L);
    album.setTitle("Album");
    when(editRequestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumRepository.findById(9L)).thenReturn(Optional.of(album));

    editRequestService.approve(1L, "admin@b.com");

    assertThat(album.getDescription()).isEqualTo("New description");
    assertThat(request.getStatus()).isEqualTo(EditRequestStatus.APPROVED);
    assertThat(request.getReviewedBy()).isEqualTo(admin);
  }

  @Test
  void approveNotifiesTheRequesterWithTheAlbumApprovedType() {
    EditRequest request = pendingAlbumRequest();
    Album album = new Album();
    album.setId(9L);
    album.setTitle("Album");
    when(editRequestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumRepository.findById(9L)).thenReturn(Optional.of(album));

    editRequestService.approve(1L, "admin@b.com");

    verify(notificationService)
        .notify(
            eq(requester),
            eq(admin),
            eq(NotificationType.ALBUM_EDIT_REQUEST_APPROVED),
            eq(9L),
            eq("Album"));
  }

  @Test
  void rejectNotifiesTheRequesterWithoutChangingTheAlbumsDescription() {
    EditRequest request = pendingAlbumRequest();
    Album album = new Album();
    album.setId(9L);
    album.setTitle("Album");
    album.setDescription("Original description");
    when(editRequestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumRepository.findById(9L)).thenReturn(Optional.of(album));

    editRequestService.reject(1L, "admin@b.com");

    assertThat(request.getStatus()).isEqualTo(EditRequestStatus.REJECTED);
    assertThat(album.getDescription()).isEqualTo("Original description");
    verify(notificationService)
        .notify(
            eq(requester),
            eq(admin),
            eq(NotificationType.ALBUM_EDIT_REQUEST_REJECTED),
            any(),
            any());
  }

  @Test
  void rejectForAnArtistRequestUsesTheArtistNotificationType() {
    EditRequest request = pendingAlbumRequest();
    request.setTargetType(EditRequestTargetType.ARTIST);
    when(editRequestRepository.findById(1L)).thenReturn(Optional.of(request));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    Artist artist = new Artist();
    artist.setId(9L);
    artist.setArtistName("Artist");
    when(artistRepository.findById(9L)).thenReturn(Optional.of(artist));

    editRequestService.reject(1L, "admin@b.com");

    verify(notificationService)
        .notify(
            eq(requester),
            eq(admin),
            eq(NotificationType.ARTIST_EDIT_REQUEST_REJECTED),
            any(),
            eq("Artist"));
  }

  @Test
  void toResponseUsesAPlaceholderNameWhenTheAlbumWasDeleted() {
    EditRequest request = pendingAlbumRequest();
    when(editRequestRepository.findAllByOrderByCreatedAtDesc(any()))
        .thenReturn(new org.springframework.data.domain.PageImpl<>(java.util.List.of(request)));
    when(albumRepository.findById(9L)).thenReturn(Optional.empty());
    when(editRequestMapper.toResponse(request, "Deleted album", null))
        .thenReturn(
            new EditRequestResponse(
                1L,
                EditRequestTargetType.ALBUM,
                9L,
                "Deleted album",
                null,
                "d",
                EditRequestStatus.PENDING,
                "requester",
                2L,
                null,
                null,
                null));

    var response = editRequestService.getAllRequests(0, 20);

    assertThat(response.content().get(0).targetName()).isEqualTo("Deleted album");
  }
}
