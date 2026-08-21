import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatDock from "../../features/chat/components/ChatDock";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatDock />
    </>
  );
}

export default Layout;
