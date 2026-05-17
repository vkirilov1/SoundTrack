package org.soundtrack.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record AuthResponse(
    @Schema(
            description =
                "JWT Bearer token. Pass as 'Authorization: Bearer <token>' on protected endpoints")
        String token) {}
