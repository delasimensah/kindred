"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@mantine/core";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import React from "react";

import { LoadingScreen, Text } from "@/components";

const HomeAuthenticated = () => {
  const { signOut } = useAuthActions();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6">
      <Text className="text-2xl font-semibold text-white">Kindred</Text>
      <Text className="text-base text-white/80">
        Thin scaffold. Artist Studio and fan surfaces land after screen design
        and Linear tickets.
      </Text>
      <Button onClick={() => void signOut()}>Sign out</Button>
    </main>
  );
};

const HomeRoute = () => {
  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Unauthenticated>
        <meta httpEquiv="refresh" content="0;url=/sign-in" />
      </Unauthenticated>
      <Authenticated>
        <HomeAuthenticated />
      </Authenticated>
    </>
  );
};

export default HomeRoute;
