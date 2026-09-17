"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { LoadingScreen } from "@/components";

const RedirectToSignIn = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);
  return <LoadingScreen />;
};

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
};

export default MainAppLayout;
