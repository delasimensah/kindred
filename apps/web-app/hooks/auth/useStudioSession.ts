"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type StudioSession = {
  isSessionLoading: boolean;
  canAccessStudio: boolean;
  isAdmin: boolean;
  artistId: Id<"artists"> | null;
  displayName: string;
  isSigningOut: boolean;
  handleSignOut: () => Promise<void>;
};

const StudioSessionContext = createContext<StudioSession | null>(null);

function useStudioSessionState(): StudioSession {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const ensureProfile = useMutation(api.profiles.ensureProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) {
          setProfileReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ensureProfile, isAuthenticated, isLoading, router]);

  const viewer = useQuery(
    api.profiles.getMe,
    isAuthenticated && profileReady ? {} : "skip"
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  const isSessionLoading =
    isLoading || !isAuthenticated || !profileReady || viewer === undefined;

  return {
    isSessionLoading,
    canAccessStudio: viewer?.canAccessStudio === true,
    isAdmin: viewer?.isAdmin === true,
    artistId: viewer?.artistId ?? null,
    displayName: viewer?.displayName ?? "",
    isSigningOut,
    handleSignOut,
  };
}

export function StudioSessionProvider({ children }: { children: ReactNode }) {
  const session = useStudioSessionState();
  return createElement(
    StudioSessionContext.Provider,
    { value: session },
    children
  );
}

export function useStudioSession(): StudioSession {
  const session = useContext(StudioSessionContext);
  if (session === null) {
    throw new Error(
      "useStudioSession must be used under StudioSessionProvider"
    );
  }
  return session;
}
