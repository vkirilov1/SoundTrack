package org.soundtrack.api.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessagePayload(@NotBlank @Size(max = 1000) String content) {}
