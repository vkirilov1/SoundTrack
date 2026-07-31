import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "../features/auth/stores/AuthProvider";

interface AppProviderProps {
  children: ReactNode;
}

function AppProvider({ children }: AppProviderProps) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

export default AppProvider;
