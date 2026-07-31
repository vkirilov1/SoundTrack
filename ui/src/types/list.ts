export interface UserListSummary {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
  coverUrl: string | null;
  containsAlbum: boolean;
}
