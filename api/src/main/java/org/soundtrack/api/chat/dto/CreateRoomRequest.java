package org.soundtrack.api.chat.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.soundtrack.domain.model.TopicType;

public record CreateRoomRequest(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotNull TopicType topicType,
    @NotNull Long topicId,
    @Min(2) @Max(100) Integer maxCapacity) {}
