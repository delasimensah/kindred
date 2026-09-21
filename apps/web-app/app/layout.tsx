import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import React from "react";

import { clashDisplay, satoshi } from "@/constants";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kindred",
  description:
    "Patronage app for rising African artists — Artist Studio on web, fans on mobile.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${clashDisplay.variable}`}
      {...mantineHtmlProps}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className="bg-page font-ui text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
