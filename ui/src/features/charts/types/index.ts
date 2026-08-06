export interface AlbumSummaryArtist {
  id: number;
  name: string;
}

export interface AlbumSummary {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string;
  rating: number;
  reviewsCount: number;
  artists: AlbumSummaryArtist[];
  genres: string[];
  favorited: boolean;
}

export type ChartSortField =
  "alphabetically" | "rating" | "releaseDate" | "reviewsCount";
