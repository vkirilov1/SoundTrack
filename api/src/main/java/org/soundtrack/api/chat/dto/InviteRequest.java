package org.soundtrack.api.chat.dto;

import jakarta.validation.constraints.NotNull;

public record InviteRequest(@NotNull Long userId) {}
