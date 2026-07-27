export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  profilePictureUrl: string | null;
  joinDate: string;
}

export type FieldErrors = Record<string, string>;
