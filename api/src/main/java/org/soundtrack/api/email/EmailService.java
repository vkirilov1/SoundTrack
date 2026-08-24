package org.soundtrack.api.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.soundtrack.api.contact.dto.ContactRequestType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Thin wrapper around JavaMailSender. Failures are logged, not thrown - callers (e.g. "forgot
 * password") must never let an SMTP outage reveal whether an account exists, or block a request on
 * an outbound mail server being reachable.
 */
@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;

  @Value("${app.mail.from}")
  private String fromAddress;

  @Value("${app.mail.support-to}")
  private String supportAddress;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void send(String to, String subject, String plainText, String htmlText) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromAddress);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(plainText, htmlText);
      mailSender.send(message);
    } catch (MailException | MessagingException e) {
      log.error("Failed to send email to {}", to, e);
    }
  }

  public void sendPasswordResetEmail(String to, String resetLink) {
    String plainText =
        "We received a request to reset your SoundTrack password.\n\n"
            + "Click the link below to choose a new one. This link expires in 30 minutes and can"
            + " only be used once.\n\n"
            + resetLink
            + "\n\nIf you didn't request this, you can safely ignore this email.";

    send(to, "Reset your SoundTrack password", plainText, EmailTemplates.passwordReset(resetLink));
  }

  public void sendAccountDeletionEmail(String to, String restoreLink) {
    String plainText =
        "We received a request to delete your SoundTrack account. It's been deactivated and will"
            + " be permanently erased in 30 days.\n\n"
            + "Changed your mind? Visit the link below any time before then to restore it:\n\n"
            + restoreLink
            + "\n\nIf you requested this yourself, no action is needed.";

    send(
        to,
        "Your SoundTrack account is scheduled for deletion",
        plainText,
        EmailTemplates.accountDeletion(restoreLink));
  }

  public void sendContactSubmission(
      ContactRequestType type,
      String fromLabel,
      String replyToEmail,
      String message,
      MultipartFile attachment) {
    boolean hasAttachment = attachment != null && !attachment.isEmpty();

    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, hasAttachment, "UTF-8");
      helper.setFrom(fromAddress);
      helper.setTo(supportAddress);
      helper.setReplyTo(replyToEmail);
      helper.setSubject("[SoundTrack Contact] " + type.getLabel() + " - " + fromLabel);
      helper.setText(
          "From: "
              + fromLabel
              + " <"
              + replyToEmail
              + ">\nType: "
              + type.getLabel()
              + "\n\n"
              + message);

      if (hasAttachment) {
        String filename =
            attachment.getOriginalFilename() != null
                ? attachment.getOriginalFilename()
                : "attachment";
        helper.addAttachment(filename, attachment);
      }

      mailSender.send(mimeMessage);
    } catch (MailException | MessagingException e) {
      log.error("Failed to send contact submission email", e);
      throw new IllegalStateException("Couldn't send your message. Please try again.", e);
    }
  }
}
