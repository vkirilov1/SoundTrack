"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../../theme/system";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

// forcedTheme="light" until the whole app is migrated off CSS Modules —
// letting color mode follow the OS preference would flip only the
// Chakra-based parts of the page dark, since everything else still has
// hardcoded light colors.
export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider forcedTheme="light" {...props} />
    </ChakraProvider>
  );
}
