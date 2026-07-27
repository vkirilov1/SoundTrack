import { createContext } from "react";
import type { LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

export interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  register: (payload: RegisterRequest) => Promise<UserProfile>;
  login: (payload: LoginRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
