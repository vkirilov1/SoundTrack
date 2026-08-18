import type { AlbumSummary } from "./album";

export interface UserListSummary {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
  coverUrl: string | null;
  containsAlbum: boolean;
}

export interface UserListDetail {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  ownerUsername: string;
  createdAt: string;
  albums: AlbumSummary[];
}
