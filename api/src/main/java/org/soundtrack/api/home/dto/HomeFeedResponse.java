package org.soundtrack.api.home.dto;

import java.util.List;
import org.soundtrack.api.chart.dto.AlbumSummaryResponse;
import org.soundtrack.api.chat.dto.ChatRoomResponse;

public record HomeFeedResponse(
    HomeStatsResponse stats,
    ChatRoomResponse activeRoom,
    FollowingReviewResponse recentFollowingReview,
    List<ChatRoomResponse> suggestedRooms,
    List<AlbumSummaryResponse> trendingAlbums,
    GenrePickResponse genrePick) {}
