export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UserListSummary {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
}

export interface FavoriteAlbum {
  id: number;
  title: string;
  coverUrl: string;
  releaseDate: string;
  artistNames: string[];
}

export interface FavoriteSong {
  id: number;
  title: string;
  duration: string;
  position: number;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string;
  artistNames: string[];
}

export interface UserReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  edited: boolean;
  createdAt: string;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string;
}
