package org.soundtrack.api.drops.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.drops.dto.CreateAlbumSuggestionRequest;
import org.soundtrack.domain.model.AlbumSuggestion;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumSuggestionRepository;

@ExtendWith(MockitoExtension.class)
class DropsServiceTest {

  @Mock private AlbumSuggestionRepository albumSuggestionRepository;
  @Mock private CurrentUserService currentUserService;

  private DropsService dropsService;
  private final User user = User.builder().id(1L).build();

  @BeforeEach
  void setUp() {
    dropsService = new DropsService(albumSuggestionRepository, currentUserService);
  }

  @Test
  void savesASuggestionAttributedToTheCaller() {
    when(currentUserService.getAuthenticatedUser()).thenReturn(user);
    CreateAlbumSuggestionRequest request =
        new CreateAlbumSuggestionRequest("Title", "Artist", LocalDate.of(2026, 1, 1), "note");

    dropsService.suggestAlbum(request);

    ArgumentCaptor<AlbumSuggestion> captor = ArgumentCaptor.forClass(AlbumSuggestion.class);
    verify(albumSuggestionRepository).save(captor.capture());
    assertThat(captor.getValue().getSubmittedBy()).isEqualTo(user);
    assertThat(captor.getValue().getTitle()).isEqualTo("Title");
    assertThat(captor.getValue().getArtistName()).isEqualTo("Artist");
    assertThat(captor.getValue().getNote()).isEqualTo("note");
  }
}
