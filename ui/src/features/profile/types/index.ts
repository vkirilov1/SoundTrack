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
  createdAt: string;
  albumId: number;
  albumTitle: string;
  albumCoverUrl: string;
}
