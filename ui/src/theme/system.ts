import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
      "2xl": "1536px",
    },
    tokens: {
      colors: {
        ink: { value: "#08060d" },
        inkBlack: { value: "#000000" },
        text: { value: "#6b6b76" },
        border: { value: "#e5e4e7" },
        accent: { value: "#f7a43f" },
        accentHover: { value: "#e6912b" },
        chatBg: { value: "#0b1b3f" },
        highlightBg: { value: "#dbe8ff" },
        highlightIconBorder: { value: "#2f6bff" },
        checkbox: { value: "#5b4fe0" },
        linkHover: { value: "#1e3a8a" },
        star: { value: "#ffb400" },
        starEmpty: { value: "#e2e1e6" },
        danger: { value: "#b3261e" },
        dangerHover: { value: "#8f1c15" },
        dangerBg: { value: "#fdecec" },
        success: { value: "#1a7f37" },
        favorite: { value: "#e11d48" },
      },
      radii: {
        md: { value: "8px" },
        lg: { value: "20px" },
        full: { value: "999px" },
      },
      fonts: {
        body: { value: "'Segoe UI', system-ui, Roboto, sans-serif" },
        heading: { value: "'Segoe UI', system-ui, Roboto, sans-serif" },
      },
      sizes: {
        contentWidth: { value: "1160px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
