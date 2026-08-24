package org.soundtrack.api.drops.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.service.CurrentUserService;
import org.soundtrack.api.drops.dto.CreateAlbumSuggestionRequest;
import org.soundtrack.domain.model.AlbumSuggestion;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumSuggestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DropsService {

  private final AlbumSuggestionRepository albumSuggestionRepository;
  private final CurrentUserService currentUserService;

  @Transactional
  public void suggestAlbum(CreateAlbumSuggestionRequest request) {
    User submitter = currentUserService.getAuthenticatedUser();

    AlbumSuggestion suggestion =
        AlbumSuggestion.builder()
            .submittedBy(submitter)
            .title(request.title())
            .artistName(request.artistName())
            .releaseDate(request.releaseDate())
            .note(request.note())
            .build();

    albumSuggestionRepository.save(suggestion);
  }
}
