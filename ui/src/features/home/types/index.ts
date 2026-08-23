import type { AlbumSummary } from "../../../types/album";
import type { ChatRoomInfo } from "../../chat/types";

export interface HomeStats {
  reviewCount: number;
  averageRating: number;
  followerCount: number;
}

export interface FollowingReview {
  reviewId: number;
  reviewerId: number;
  reviewerUsername: string;
  reviewerProfilePicture: string | null;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string | null;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface GenrePick {
  genre: string;
  albums: AlbumSummary[];
}

export interface HomeFeed {
  stats: HomeStats;
  activeRoom: ChatRoomInfo | null;
  recentFollowingReview: FollowingReview | null;
  suggestedRooms: ChatRoomInfo[];
  trendingAlbums: AlbumSummary[];
  genrePick: GenrePick | null;
}
