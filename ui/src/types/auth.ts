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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export type UserRole = "USER" | "ADMIN";

export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  profilePictureUrl: string | null;
  joinDate: string;
  role: UserRole;
  followed: boolean;
  followsYou: boolean;
  chatAccessRevoked: boolean;
}

export type FieldErrors = Record<string, string>;
