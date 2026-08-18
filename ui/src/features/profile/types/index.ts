import type { AlbumSummaryArtist } from "../../../types/album";

export interface FavoriteSong {
  id: number;
  title: string;
  duration: string;
  position: number;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string;
  artists: AlbumSummaryArtist[];
}

export interface UserReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string;
}
