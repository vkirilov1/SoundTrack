package org.soundtrack.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

  private JwtService jwtService;

  @BeforeEach
  void setUp() {
    jwtService = new JwtService();
    String secret =
        Encoders.BASE64.encode(Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded());
    ReflectionTestUtils.setField(jwtService, "secret", secret);
    ReflectionTestUtils.setField(jwtService, "expiration", 60_000L);
  }

  @Test
  void extractsTheEmailItWasGeneratedFor() {
    String token = jwtService.generateToken("user@example.com");

    assertThat(jwtService.extractEmail(token)).isEqualTo("user@example.com");
  }

  @Test
  void isValidForTheMatchingEmail() {
    String token = jwtService.generateToken("user@example.com");

    assertThat(jwtService.isValid(token, "user@example.com")).isTrue();
  }

  @Test
  void isNotValidForADifferentEmail() {
    String token = jwtService.generateToken("user@example.com");

    assertThat(jwtService.isValid(token, "someone-else@example.com")).isFalse();
  }

  @Test
  void parsingAnExpiredTokenThrows() {
    ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
    String token = jwtService.generateToken("user@example.com");

    assertThatThrownBy(() -> jwtService.isValid(token, "user@example.com"))
        .isInstanceOf(ExpiredJwtException.class);
  }
}
