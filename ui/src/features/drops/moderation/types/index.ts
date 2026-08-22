export type AlbumSuggestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AlbumSuggestion {
  id: number;
  submittedByUsername: string | null;
  title: string;
  artistName: string;
  releaseDate: string | null;
  note: string | null;
  status: AlbumSuggestionStatus;
  reviewedByUsername: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
