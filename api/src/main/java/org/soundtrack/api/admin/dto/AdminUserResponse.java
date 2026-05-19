package org.soundtrack.api.admin.dto;

import java.time.LocalDateTime;
import org.soundtrack.domain.model.UserRole;

public record AdminUserResponse(
    Long id,
    String username,
    String email,
    UserRole role,
    LocalDateTime joinDate) {}
