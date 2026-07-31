import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/app";
import AppProvider from "./app/provider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
