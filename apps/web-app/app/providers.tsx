"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ConvexReactClient } from "convex/react";
import React, { useMemo } from "react";

import { mantineTheme } from "@/theme/mantine-theme";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Stand-in so `next build` / first Vercel deploy work before the Convex cloud workshop tick. */
const CONVEX_URL_BUILD_PLACEHOLDER = "https://placeholder.convex.cloud";

export const Providers = ({ children }: ProvidersProps) => {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? CONVEX_URL_BUILD_PLACEHOLDER;
    return new ConvexReactClient(url);
  }, []);

  return (
    <ConvexAuthProvider client={convex}>
      <MantineProvider theme={mantineTheme}>
        {children}
        <Notifications position="top-right" />
      </MantineProvider>
    </ConvexAuthProvider>
  );
};
