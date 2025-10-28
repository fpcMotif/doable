'use client';

import { ThemeProvider } from "next-themes";
import { ConvexProviderWithAuth } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@convex-dev/auth/react";

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