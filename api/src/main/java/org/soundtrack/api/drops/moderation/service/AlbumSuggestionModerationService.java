package org.soundtrack.api.drops.moderation.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.dto.PagedResponse;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.drops.dto.AlbumSuggestionResponse;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.AlbumSuggestion;
import org.soundtrack.domain.model.AlbumSuggestionStatus;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumSuggestionRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlbumSuggestionModerationService {

  private final AlbumSuggestionRepository albumSuggestionRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  @Transactional(readOnly = true)
  public PagedResponse<AlbumSuggestionResponse> getSuggestions(int page, int size) {
    Page<AlbumSuggestion> suggestionPage =
        albumSuggestionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));

    List<AlbumSuggestionResponse> content =
        suggestionPage.getContent().stream().map(this::toResponse).toList();

    return new PagedResponse<>(
        content, page, size, suggestionPage.getTotalElements(), suggestionPage.getTotalPages());
  }

  @Transactional
  public AlbumSuggestionResponse approve(Long suggestionId, String adminEmail) {
    return decide(
        suggestionId,
        adminEmail,
        AlbumSuggestionStatus.APPROVED,
        NotificationType.ALBUM_SUGGESTION_APPROVED);
  }

  @Transactional
  public AlbumSuggestionResponse reject(Long suggestionId, String adminEmail) {
    return decide(
        suggestionId,
        adminEmail,
        AlbumSuggestionStatus.REJECTED,
        NotificationType.ALBUM_SUGGESTION_REJECTED);
  }

  private AlbumSuggestionResponse decide(
      Long suggestionId, String adminEmail, AlbumSuggestionStatus outcome, NotificationType type) {
    AlbumSuggestion suggestion = findSuggestion(suggestionId);

    if (suggestion.getStatus() != AlbumSuggestionStatus.PENDING) {
      throw new InvalidOperationException("This suggestion has already been reviewed");
    }

    User admin = findUserByEmail(adminEmail);

    suggestion.setStatus(outcome);
    suggestion.setReviewedBy(admin);
    suggestion.setReviewedAt(LocalDateTime.now());
    AlbumSuggestion saved = albumSuggestionRepository.save(suggestion);

    if (suggestion.getSubmittedBy() != null) {
      notificationService.notify(
          suggestion.getSubmittedBy(), admin, type, null, suggestion.getTitle());
    }

    return toResponse(saved);
  }

  private AlbumSuggestionResponse toResponse(AlbumSuggestion s) {
    return new AlbumSuggestionResponse(
        s.getId(),
        s.getSubmittedBy() != null ? s.getSubmittedBy().getUsername() : null,
        s.getTitle(),
        s.getArtistName(),
        s.getReleaseDate(),
        s.getNote(),
        s.getStatus(),
        s.getReviewedBy() != null ? s.getReviewedBy().getUsername() : null,
        s.getReviewedAt(),
        s.getCreatedAt());
  }

  private AlbumSuggestion findSuggestion(Long id) {
    return albumSuggestionRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found"));
  }

  private User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
