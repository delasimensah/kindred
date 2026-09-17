"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { LoadingScreen, SignInForm, Text } from "@/components";

const RedirectHome = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <LoadingScreen />;
};

const SignInRoute = () => {
  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Authenticated>
        <RedirectHome />
      </Authenticated>
      <Unauthenticated>
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6">
          <div className="flex flex-col gap-2">
            <Text className="text-3xl font-semibold text-darkGrey">Kindred</Text>
            <Text className="text-base text-darkGrey">
              Sign in with email and password.
            </Text>
          </div>
          <SignInForm />
        </main>
      </Unauthenticated>
    </>
  );
};

export default SignInRoute;
