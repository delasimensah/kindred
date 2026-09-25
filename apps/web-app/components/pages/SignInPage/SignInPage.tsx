"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import SignInForm from "../../auth/SignInForm/SignInForm";
import StudioWordmark from "../../auth/StudioWordmark/StudioWordmark";
import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";
import Text from "../../ui/Text/Text";

/**
 * Artist Studio sign-in.
 * Design: docs/design/exports/web/01-studio/01-sign-in.html
 * Layout uses real viewport width (375px–1280px+), not the export’s fixed 1280 frame.
 */
const SignInPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-page px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/5 bg-surface px-6 py-10 shadow-2xl sm:px-10 sm:py-11">
        <StudioWordmark />
        <SignInForm />
        <Text className="mt-7 text-center text-xs text-text/40">
          New to Kindred? Request studio access from the Kindred mobile app.
        </Text>
      </div>

      <Text className="relative z-10 mt-8 text-xs text-text/30 sm:absolute sm:bottom-6 sm:mt-0">
        © {new Date().getFullYear()} Kindred Artist Studio
      </Text>
    </div>
  );
};

export default SignInPage;
