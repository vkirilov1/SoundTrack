export type SearchResultType = "ALBUM" | "ARTIST";

export interface SearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
}

export interface SearchResponse {
  albums: SearchResult[];
  artists: SearchResult[];
}
