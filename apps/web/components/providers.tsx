"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthSync } from "@/components/auth-sync";
import { CommandKProvider } from "@/components/command-k";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <CommandKProvider>
        <AuthSync />
        {children}
      </CommandKProvider>
    </NextThemesProvider>
  );
}
