package org.soundtrack.api.drops.service;

import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.ResourceNotFoundException;
import org.soundtrack.api.drops.dto.CreateAlbumSuggestionRequest;
import org.soundtrack.domain.model.AlbumSuggestion;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.AlbumSuggestionRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DropsService {

  private final AlbumSuggestionRepository albumSuggestionRepository;
  private final UserRepository userRepository;

  @Transactional
  public void suggestAlbum(CreateAlbumSuggestionRequest request) {
    User submitter = getAuthenticatedUser();

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

  private User getAuthenticatedUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return userRepository
        .findByEmail(auth.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
