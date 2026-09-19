"use client";

import React from "react";

import { Text } from "@/components";

/**
 * Scaffold blank slate. Auth UI and product surfaces land with screen
 * design and Linear tickets — not at workshop scaffold.
 */
const HomeRoute = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6">
      <Text className="text-3xl font-semibold text-white">Kindred</Text>
      <Text className="text-base text-white/80">
        Patronage app for rising African artists. Fans support artists with a
        monthly subscription routed to the artists they choose.
      </Text>
    </main>
  );
};

export default HomeRoute;
