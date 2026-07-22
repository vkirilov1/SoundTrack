package org.soundtrack.api.auth.util;

import java.time.Duration;
import org.springframework.http.ResponseCookie;

public final class CookieUtil {

  private CookieUtil() {}

  public static ResponseCookie build(
      String name, String value, String path, Duration maxAge, boolean secure) {
    return ResponseCookie.from(name, value)
        .httpOnly(true)
        .secure(secure)
        .sameSite("Lax")
        .path(path)
        .maxAge(maxAge)
        .build();
  }

  public static ResponseCookie clear(String name, String path, boolean secure) {
    return ResponseCookie.from(name, "")
        .httpOnly(true)
        .secure(secure)
        .sameSite("Lax")
        .path(path)
        .maxAge(Duration.ZERO)
        .build();
  }
}
