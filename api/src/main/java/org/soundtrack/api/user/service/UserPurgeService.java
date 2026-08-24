package org.soundtrack.api.user.service;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.chat.service.ChatService;
import org.soundtrack.api.review.service.ReviewService;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.model.UserRole;
import org.soundtrack.domain.repository.AccountDeletionTokenRepository;
import org.soundtrack.domain.repository.ChatMessageRepository;
import org.soundtrack.domain.repository.EditRequestRepository;
import org.soundtrack.domain.repository.NotificationRepository;
import org.soundtrack.domain.repository.PasswordResetTokenRepository;
import org.soundtrack.domain.repository.RefreshTokenRepository;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserPurgeService {

  private static final String PLACEHOLDER_USERNAME = "deleted-user";
  private static final String PLACEHOLDER_EMAIL = "deleted-user@soundtrack.local";

  private final UserRepository userRepository;
  private final ReviewService reviewService;
  private final ChatService chatService;
  private final ChatMessageRepository chatMessageRepository;
  private final NotificationRepository notificationRepository;
  private final EditRequestRepository editRequestRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final AccountDeletionTokenRepository accountDeletionTokenRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public void purge(User user) {
    Long userId = user.getId();

    reviewService.deleteAllReviewsByUser(userId);

    chatService.forceCloseRoomsCreatedBy(userId);
    chatMessageRepository.reassignSender(userId, getOrCreateDeletedUserPlaceholder());

    notificationRepository.deleteByRecipientId(userId);
    notificationRepository.deleteByActorId(userId);

    editRequestRepository.clearReviewedBy(userId);
    editRequestRepository.deleteByRequestedById(userId);

    refreshTokenRepository.deleteByUserId(userId);
    passwordResetTokenRepository.deleteByUserId(userId);
    accountDeletionTokenRepository.deleteByUserId(userId);

    userRepository.delete(user);
  }

  private User getOrCreateDeletedUserPlaceholder() {
    return userRepository
        .findByUsername(PLACEHOLDER_USERNAME)
        .orElseGet(
            () ->
                userRepository.save(
                    User.builder()
                        .username(PLACEHOLDER_USERNAME)
                        .email(PLACEHOLDER_EMAIL)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(UserRole.USER)
                        .joinDate(LocalDateTime.now())
                        .profilePicture("userDefault.png")
                        .build()));
  }
}
