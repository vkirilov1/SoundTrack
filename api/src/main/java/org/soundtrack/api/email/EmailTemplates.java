package org.soundtrack.api.email;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import org.springframework.core.io.ClassPathResource;

final class EmailTemplates {

  private static final String LOGO_DATA_URI = loadLogoDataUri();

  private EmailTemplates() {}

  static String passwordReset(String resetLink) {
    return """
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI', Roboto, Arial, sans-serif;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%%; background:#ffffff; border-radius:12px; border:1px solid #e5e4e7;">
                    <tr>
                      <td style="padding:36px 40px 8px;">
                        <img src="%s" alt="SoundTrack" width="170" style="display:block; height:auto;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 40px 0;">
                        <h1 style="margin:0; font-size:20px; color:#08060d;">Reset your password</h1>
                        <p style="margin:12px 0 0; font-size:14px; line-height:1.6; color:#6b6b76;">
                          We received a request to reset your SoundTrack password. Click the
                          button below to choose a new one. This link expires in 30 minutes and
                          can only be used once.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 40px 0;">
                        <a href="%s" style="display:inline-block; background:#f7a43f; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:12px 28px; border-radius:8px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px 0;">
                        <p style="margin:0; font-size:12px; line-height:1.6; color:#a3a3ad;">
                          Or paste this link into your browser:<br />
                          <a href="%s" style="color:#e6912b; word-break:break-all;">%s</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 40px 32px;">
                        <p style="margin:0; font-size:12px; color:#a3a3ad; border-top:1px solid #e5e4e7; padding-top:16px;">
                          If you didn't request this, you can safely ignore this email - your
                          password won't change.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """
        .formatted(LOGO_DATA_URI, resetLink, resetLink, resetLink);
  }

  static String accountDeletion(String restoreLink) {
    return """
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI', Roboto, Arial, sans-serif;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%%; background:#ffffff; border-radius:12px; border:1px solid #e5e4e7;">
                    <tr>
                      <td style="padding:36px 40px 8px;">
                        <img src="%s" alt="SoundTrack" width="170" style="display:block; height:auto;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 40px 0;">
                        <h1 style="margin:0; font-size:20px; color:#08060d;">Your account is scheduled for deletion</h1>
                        <p style="margin:12px 0 0; font-size:14px; line-height:1.6; color:#6b6b76;">
                          We received a request to delete your SoundTrack account. It's been
                          deactivated and will be permanently erased in 30 days. Changed your
                          mind? Click the button below any time before then to restore it.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 40px 0;">
                        <a href="%s" style="display:inline-block; background:#f7a43f; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:12px 28px; border-radius:8px;">
                          Restore My Account
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px 0;">
                        <p style="margin:0; font-size:12px; line-height:1.6; color:#a3a3ad;">
                          Or paste this link into your browser:<br />
                          <a href="%s" style="color:#e6912b; word-break:break-all;">%s</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 40px 32px;">
                        <p style="margin:0; font-size:12px; color:#a3a3ad; border-top:1px solid #e5e4e7; padding-top:16px;">
                          If you requested this yourself, no action is needed - your account will
                          be erased automatically after the 30 days.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """
        .formatted(LOGO_DATA_URI, restoreLink, restoreLink, restoreLink);
  }

  private static String loadLogoDataUri() {
    try (InputStream in = new ClassPathResource("email/soundtrack-logo.png").getInputStream()) {
      return "data:image/png;base64," + Base64.getEncoder().encodeToString(in.readAllBytes());
    } catch (IOException e) {
      throw new IllegalStateException("Missing email/soundtrack-logo.png on the classpath", e);
    }
  }
}
