package org.soundtrack.api.home.dto;

import java.time.LocalDateTime;

public record FollowingReviewResponse(
    Long reviewId,
    Long reviewerId,
    String reviewerUsername,
    String reviewerProfilePicture,
    Long albumId,
    String albumTitle,
    String albumCoverUrl,
    double rating,
    String title,
    String comment,
    LocalDateTime createdAt) {}
