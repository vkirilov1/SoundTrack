package org.soundtrack.api.user.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.UserRole;

public record UserProfileResponse(
    Long id,
    String username,
    String bio,
    String profilePictureUrl,
    LocalDateTime joinDate,
    UserRole role) {}
