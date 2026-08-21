import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider as ChakraProvider } from "../components/ui/provider";
import AuthProvider from "../features/auth/stores/AuthProvider";
import ChatProvider from "../features/chat/stores/ChatProvider";

interface AppProviderProps {
  children: ReactNode;
}

function AppProvider({ children }: AppProviderProps) {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default AppProvider;
