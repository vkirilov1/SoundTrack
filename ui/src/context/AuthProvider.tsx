import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/authApi";
import {
  setSessionRefreshedHandler,
  setUnauthorizedHandler,
} from "../api/httpClient";
import type { LoginRequest, RegisterRequest, UserProfile } from "../types/auth";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    setSessionRefreshedHandler(() => {
      fetchCurrentUser()
        .then(setUser)
        .catch(() => setUser(null));
    });
    return () => {
      setUnauthorizedHandler(null);
      setSessionRefreshedHandler(null);
    };
  }, []);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const profile = await registerRequest(payload);
    setUser(profile);
    return profile;
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const profile = await loginRequest(payload);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const updateUser = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
