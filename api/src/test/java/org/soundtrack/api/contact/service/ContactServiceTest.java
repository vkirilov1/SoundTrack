package org.soundtrack.api.contact.service;

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
import org.soundtrack.api.contact.dto.ContactRequestType;
import org.soundtrack.api.email.EmailService;
import org.soundtrack.domain.model.User;
import org.soundtrack.domain.repository.UserRepository;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

  @Mock private EmailService emailService;
  @Mock private UserRepository userRepository;

  private ContactService contactService;

  @BeforeEach
  void setUp() {
    contactService = new ContactService(emailService, userRepository);
  }

  private Authentication authOf(String email) {
    return new UsernamePasswordAuthenticationToken(email, null, java.util.List.of());
  }

  @Test
  void rejectsABlankMessage() {
    assertThatThrownBy(
            () -> contactService.submit(ContactRequestType.OTHER, "   ", "a@b.com", null, null))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void rejectsAMessageOverTheLengthLimit() {
    String tooLong = "a".repeat(3001);

    assertThatThrownBy(
            () -> contactService.submit(ContactRequestType.OTHER, tooLong, "a@b.com", null, null))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void anonymousSubmissionRequiresAnEmail() {
    assertThatThrownBy(
            () -> contactService.submit(ContactRequestType.OTHER, "hello", null, null, null))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void anonymousSubmissionRejectsAMalformedEmail() {
    assertThatThrownBy(
            () ->
                contactService.submit(
                    ContactRequestType.OTHER, "hello", "not-an-email", null, null))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void anonymousSubmissionSendsUnderAnAnonymousLabel() {
    contactService.submit(ContactRequestType.OTHER, "hello", "visitor@example.com", null, null);

    verify(emailService)
        .sendContactSubmission(
            eq(ContactRequestType.OTHER),
            eq("Anonymous visitor"),
            eq("visitor@example.com"),
            eq("hello"),
            eq(null));
  }

  @Test
  void nullAuthenticationIsTreatedAsAnonymous() {
    contactService.submit(ContactRequestType.OTHER, "hello", "visitor@example.com", null, null);

    verify(userRepository, org.mockito.Mockito.never()).findByEmail(any());
  }

  @Test
  void authenticatedSubmissionUsesTheAccountsOwnEmailIgnoringTheFormField() {
    User user = User.builder().id(5L).username("vkirilov").email("real@example.com").build();
    when(userRepository.findByEmail("real@example.com")).thenReturn(Optional.of(user));

    contactService.submit(
        ContactRequestType.BUG_REPORT,
        "hello",
        "ignored@example.com",
        null,
        authOf("real@example.com"));

    verify(emailService)
        .sendContactSubmission(
            eq(ContactRequestType.BUG_REPORT),
            eq("vkirilov (user #5)"),
            eq("real@example.com"),
            eq("hello"),
            eq(null));
  }

  @Test
  void fallsBackToAnonymousWhenTheAuthenticatedEmailHasNoMatchingUser() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                contactService.submit(
                    ContactRequestType.OTHER, "hello", null, null, authOf("ghost@example.com")))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void rejectsANonImageAttachment() {
    MultipartFile attachment =
        new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[] {1});

    assertThatThrownBy(
            () ->
                contactService.submit(
                    ContactRequestType.OTHER, "hello", "a@b.com", attachment, null))
        .isInstanceOf(InvalidOperationException.class);
  }

  @Test
  void acceptsAValidImageAttachment() {
    MultipartFile attachment =
        new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[] {1});

    contactService.submit(ContactRequestType.OTHER, "hello", "a@b.com", attachment, null);

    verify(emailService).sendContactSubmission(any(), any(), any(), any(), eq(attachment));
  }
}
