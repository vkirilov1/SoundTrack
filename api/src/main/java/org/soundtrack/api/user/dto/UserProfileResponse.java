package org.soundtrack.api.user.dto;

import java.time.LocalDateTime;

public record UserProfileResponse(
    Long id, String username, String bio, String profilePictureUrl, LocalDateTime joinDate) {}
