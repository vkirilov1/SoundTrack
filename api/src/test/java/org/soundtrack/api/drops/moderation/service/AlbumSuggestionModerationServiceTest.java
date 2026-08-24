package org.soundtrack.api.drops.moderation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.drops.dto.AlbumSuggestionResponse;
import org.soundtrack.api.notification.service.NotificationService;
import org.soundtrack.domain.model.AlbumSuggestion;
import org.soundtrack.domain.model.AlbumSuggestionStatus;
import org.soundtrack.domain.model.NotificationType;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumSuggestionRepository;
import org.soundtrack.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AlbumSuggestionModerationServiceTest {

  @Mock private AlbumSuggestionRepository albumSuggestionRepository;
  @Mock private UserRepository userRepository;
  @Mock private NotificationService notificationService;

  private AlbumSuggestionModerationService service;
  private final User admin = User.builder().id(1L).username("admin").build();

  @BeforeEach
  void setUp() {
    service =
        new AlbumSuggestionModerationService(
            albumSuggestionRepository, userRepository, notificationService);
  }

  private AlbumSuggestion pendingSuggestion(User submitter) {
    AlbumSuggestion suggestion = new AlbumSuggestion();
    suggestion.setId(1L);
    suggestion.setTitle("Title");
    suggestion.setStatus(AlbumSuggestionStatus.PENDING);
    suggestion.setSubmittedBy(submitter);
    return suggestion;
  }

  @Test
  void approveRejectsASuggestionAlreadyReviewed() {
    AlbumSuggestion suggestion = pendingSuggestion(null);
    suggestion.setStatus(AlbumSuggestionStatus.APPROVED);
    when(albumSuggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

    assertThatThrownBy(() -> service.approve(1L, "admin@b.com"))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void approveSkipsNotifyingWhenTheSubmitterIsUnknown() {
    AlbumSuggestion suggestion = pendingSuggestion(null);
    when(albumSuggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumSuggestionRepository.save(suggestion)).thenReturn(suggestion);

    service.approve(1L, "admin@b.com");

    verify(notificationService, never()).notify(any(), any(), any(), any(), any());
  }

  @Test
  void approveNotifiesTheSubmitter() {
    User submitter = User.builder().id(2L).build();
    AlbumSuggestion suggestion = pendingSuggestion(submitter);
    when(albumSuggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumSuggestionRepository.save(suggestion)).thenReturn(suggestion);

    AlbumSuggestionResponse response = service.approve(1L, "admin@b.com");

    assertThat(response.status()).isEqualTo(AlbumSuggestionStatus.APPROVED);
    verify(notificationService)
        .notify(submitter, admin, NotificationType.ALBUM_SUGGESTION_APPROVED, null, "Title");
  }

  @Test
  void rejectNotifiesTheSubmitterWithTheRejectedType() {
    User submitter = User.builder().id(2L).build();
    AlbumSuggestion suggestion = pendingSuggestion(submitter);
    when(albumSuggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
    when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.of(admin));
    when(albumSuggestionRepository.save(suggestion)).thenReturn(suggestion);

    AlbumSuggestionResponse response = service.reject(1L, "admin@b.com");

    assertThat(response.status()).isEqualTo(AlbumSuggestionStatus.REJECTED);
    verify(notificationService)
        .notify(submitter, admin, NotificationType.ALBUM_SUGGESTION_REJECTED, null, "Title");
  }
}
