package org.soundtrack.api.contact.service;

import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.common.exception.InvalidOperationException;
import org.soundtrack.api.contact.dto.ContactRequestType;
import org.soundtrack.api.email.EmailService;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ContactService {

  private static final int MAX_MESSAGE_LENGTH = 3000;
  private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s.]+\\.[^@\\s]+$");

  private final EmailService emailService;
  private final UserRepository userRepository;

  public void submit(
      ContactRequestType type,
      String message,
      String email,
      MultipartFile attachment,
      Authentication authentication) {
    String trimmedMessage = message == null ? "" : message.trim();

    if (trimmedMessage.isEmpty()) {
      throw new InvalidOperationException("Message cannot be blank");
    }
    if (trimmedMessage.length() > MAX_MESSAGE_LENGTH) {
      throw new InvalidOperationException(
          "Message is too long (max " + MAX_MESSAGE_LENGTH + " characters)");
    }

    User authenticatedUser = resolveAuthenticatedUser(authentication);

    String fromLabel;
    String replyToEmail;

    if (authenticatedUser != null) {
      fromLabel = authenticatedUser.getUsername() + " (user #" + authenticatedUser.getId() + ")";
      replyToEmail = authenticatedUser.getEmail();
    } else {
      if (email == null || email.isBlank()) {
        throw new InvalidOperationException("Email is required");
      }
      if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
        throw new InvalidOperationException("Email must follow the format Text@Text.Text");
      }
      fromLabel = "Anonymous visitor";
      replyToEmail = email.trim();
    }

    if (attachment != null && !attachment.isEmpty()) {
      validateAttachment(attachment);
    }

    emailService.sendContactSubmission(type, fromLabel, replyToEmail, trimmedMessage, attachment);
  }

  private void validateAttachment(MultipartFile attachment) {
    String contentType = attachment.getContentType();
    if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
      throw new InvalidOperationException("Attachment must be a JPEG or PNG image");
    }
  }

  private User resolveAuthenticatedUser(Authentication authentication) {
    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getName())) {
      return null;
    }
    return userRepository.findByEmail(authentication.getName()).orElse(null);
  }
}
