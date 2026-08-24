package org.soundtrack.api.editrequest.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EditRequestService {

  private final EditRequestRepository editRequestRepository;
  private final AlbumRepository albumRepository;
  private final ArtistRepository artistRepository;
  private final UserRepository userRepository;
  private final EditRequestMapper editRequestMapper;
  private final NotificationService notificationService;

  @Transactional
  public void submitAlbumDescriptionRequest(Long albumId, String description, String email) {
    Album album =
        albumRepository
            .findById(albumId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Album not found with id: " + albumId));

    submit(EditRequestTargetType.ALBUM, album.getId(), description, email);
  }

  @Transactional
  public void submitArtistDescriptionRequest(Long artistId, String description, String email) {
    Artist artist =
        artistRepository
            .findById(artistId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Artist not found with id: " + artistId));

    submit(EditRequestTargetType.ARTIST, artist.getId(), description, email);
  }

  @Transactional(readOnly = true)
  public PagedResponse<EditRequestResponse> getAllRequests(int page, int size) {
    Page<EditRequest> requestPage =
        editRequestRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));

    List<EditRequestResponse> content =
        requestPage.getContent().stream().map(this::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, requestPage.getTotalElements(), requestPage.getTotalPages());
  }

  @Transactional
  public EditRequestResponse approve(Long requestId, String adminEmail) {
    EditRequest request = getPendingOrThrow(requestId);
    User admin = findUserByEmail(adminEmail);

    applyChange(request);

    request.setStatus(EditRequestStatus.APPROVED);
    request.setReviewedBy(admin);
    request.setReviewedAt(LocalDateTime.now());

    notifyRequester(request, admin, true);

    return toResponse(request);
  }

  @Transactional
  public EditRequestResponse reject(Long requestId, String adminEmail) {
    EditRequest request = getPendingOrThrow(requestId);
    User admin = findUserByEmail(adminEmail);

    request.setStatus(EditRequestStatus.REJECTED);
    request.setReviewedBy(admin);
    request.setReviewedAt(LocalDateTime.now());

    notifyRequester(request, admin, false);

    return toResponse(request);
  }

  private void notifyRequester(EditRequest request, User admin, boolean approved) {
    boolean isAlbum = request.getTargetType() == EditRequestTargetType.ALBUM;
    NotificationType type =
        isAlbum
            ? (approved
                ? NotificationType.ALBUM_EDIT_REQUEST_APPROVED
                : NotificationType.ALBUM_EDIT_REQUEST_REJECTED)
            : (approved
                ? NotificationType.ARTIST_EDIT_REQUEST_APPROVED
                : NotificationType.ARTIST_EDIT_REQUEST_REJECTED);

    notificationService.notify(
        request.getRequestedBy(), admin, type, request.getTargetId(), resolveTargetName(request));
  }

  private void submit(
      EditRequestTargetType targetType, Long targetId, String description, String email) {
    User user = findUserByEmail(email);

    EditRequest request = new EditRequest();
    request.setTargetType(targetType);
    request.setTargetId(targetId);
    request.setRequestedBy(user);
    request.setProposedDescription(description.trim());

    editRequestRepository.save(request);
  }

  private EditRequest getPendingOrThrow(Long requestId) {
    EditRequest request =
        editRequestRepository
            .findById(requestId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Request not found with id: " + requestId));

    if (request.getStatus() != EditRequestStatus.PENDING) {
      throw new InvalidOperationException("This request has already been reviewed");
    }

    return request;
  }

  private String resolveTargetName(EditRequest request) {
    if (request.getTargetType() == EditRequestTargetType.ALBUM) {
      return albumRepository
          .findById(request.getTargetId())
          .map(Album::getTitle)
          .orElse("Deleted album");
    }
    return artistRepository
        .findById(request.getTargetId())
        .map(Artist::getArtistName)
        .orElse("Deleted artist");
  }

  private void applyChange(EditRequest request) {
    if (request.getTargetType() == EditRequestTargetType.ALBUM) {
      Album album =
          albumRepository
              .findById(request.getTargetId())
              .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
      album.setDescription(request.getProposedDescription());
    } else {
      Artist artist =
          artistRepository
              .findById(request.getTargetId())
              .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
      artist.setBiography(request.getProposedDescription());
    }
  }

  private EditRequestResponse toResponse(EditRequest request) {
    String targetName;
    String targetPhotoUrl;

    if (request.getTargetType() == EditRequestTargetType.ALBUM) {
      Album album = albumRepository.findById(request.getTargetId()).orElse(null);
      targetName = album != null ? album.getTitle() : "Deleted album";
      targetPhotoUrl = album != null ? album.getCoverUrl() : null;
    } else {
      Artist artist = artistRepository.findById(request.getTargetId()).orElse(null);
      targetName = artist != null ? artist.getArtistName() : "Deleted artist";
      targetPhotoUrl = artist != null ? artist.getArtistPic() : null;
    }

    return editRequestMapper.toResponse(request, targetName, targetPhotoUrl);
  }

  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
