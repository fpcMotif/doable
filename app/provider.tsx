"use client";

import { useAuth } from "@convex-dev/auth/react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Provider(props: { children?: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      <ThemeProvider attribute="class" forcedTheme="dark">
        {props.children}
      </ThemeProvider>
    </ConvexProviderWithAuth>
  );
}
