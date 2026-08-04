import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider as ChakraProvider } from "../components/ui/provider";
import AuthProvider from "../features/auth/stores/AuthProvider";

interface AppProviderProps {
  children: ReactNode;
}

function AppProvider({ children }: AppProviderProps) {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default AppProvider;
