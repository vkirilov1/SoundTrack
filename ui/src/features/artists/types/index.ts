export interface ArtistAlbum {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string;
  rating: number;
  favorited: boolean;
}

export interface ArtistDetail {
  id: number;
  name: string;
  country: string | null;
  type: string | null;
  biography: string | null;
  artistPic: string | null;
  albums: ArtistAlbum[];
}
