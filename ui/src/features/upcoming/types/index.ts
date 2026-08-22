export interface UpcomingRelease {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string;
  artistNames: string[];
  publishable: boolean;
}
