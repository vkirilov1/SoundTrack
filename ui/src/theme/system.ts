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
        inkBlack: { value: "#000000" },
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
    semanticTokens: {
      colors: {
        bg: { value: { base: "#ffffff", _dark: "#1c1c21" } },
        ink: { value: { base: "#08060d", _dark: "#f0f0f3" } },
        text: { value: { base: "#6b6b76", _dark: "#a3a3ad" } },
        border: { value: { base: "#e5e4e7", _dark: "#333338" } },

        accent: { value: { base: "#f7a43f", _dark: "#f7a43f" } },
        accentHover: { value: { base: "#e6912b", _dark: "#ffb75c" } },
        accentBg: { value: { base: "#faf1e6", _dark: "#3a2e1e" } },

        chatBg: { value: { base: "#0b1b3f", _dark: "#0b1b3f" } },
        highlightBg: { value: { base: "#dbe8ff", _dark: "#1f2d4d" } },
        highlightIconBorder: { value: { base: "#2f6bff", _dark: "#5b8bff" } },
        checkbox: { value: { base: "#5b4fe0", _dark: "#8b80ff" } },
        linkHover: { value: { base: "#1e3a8a", _dark: "#93b4f7" } },
        star: { value: { base: "#ffb400", _dark: "#ffc94d" } },
        starEmpty: { value: { base: "#e2e1e6", _dark: "#48484f" } },

        danger: { value: { base: "#b3261e", _dark: "#e5534b" } },
        dangerHover: { value: { base: "#8f1c15", _dark: "#c94840" } },
        dangerBg: { value: { base: "#fdecec", _dark: "#3d1f1d" } },

        success: { value: { base: "#1a7f37", _dark: "#3fb15a" } },
        favorite: { value: { base: "#e11d48", _dark: "#f04570" } },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
