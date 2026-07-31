export interface AlbumArtist {
  id: number;
  name: string;
}

export interface AlbumSong {
  id: number;
  position: number;
  title: string;
  durationSeconds: number;
  artists: AlbumArtist[];
  favorited: boolean;
}

export interface AlbumDetail {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string;
  rating: number;
  reviewsCount: number;
  artists: AlbumArtist[];
  genres: string[];
  songs: AlbumSong[];
  description: string | null;
  favorited: boolean;
}

export interface AlbumReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  username: string;
  userId: number;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface CreateAlbumReviewRequest {
  rating: number;
  title: string;
  comment: string;
}
