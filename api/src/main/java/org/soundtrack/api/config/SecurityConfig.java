package org.soundtrack.api.config;

import jakarta.servlet.DispatcherType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.soundtrack.api.auth.security.JwtAuthenticationFilter;
import org.soundtrack.domain.model.UserRole;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtFilter;
  private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(ex -> ex.authenticationEntryPoint(restAuthenticationEntryPoint))
        .authorizeHttpRequests(
            auth ->
                auth.dispatcherTypeMatchers(DispatcherType.ASYNC)
                    .permitAll()
                    .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/refresh",
                        "/api/auth/logout")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/albums/**",
                        "/api/artists/**",
                        "/api/users/*",
                        "/api/users/*/reviews",
                        "/api/users/*/followers",
                        "/api/users/*/following",
                        "/api/images/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/lists/me")
                    .authenticated()
                    .requestMatchers(
                        "/api/favorites/albums/user/*",
                        "/api/favorites/songs/user/*",
                        "/api/lists/user/*")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/lists/*")
                    .permitAll()
                    .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/search", "/api/search/users")
                    .permitAll()
                    .requestMatchers("/ws/**")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole(UserRole.ADMIN.toString())
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
