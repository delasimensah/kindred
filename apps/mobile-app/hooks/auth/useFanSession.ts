import { api } from "@convex/_generated/api";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type FanSession = {
  isSessionLoading: boolean;
  isAuthenticated: boolean;
  isViewerReady: boolean;
  displayName: string;
  genres: string[];
  followCount: number;
  hasCompletedOnboarding: boolean;
  onboardingStep: "genres" | "follows" | "done";
  isSigningOut: boolean;
  handleSignOut: () => Promise<void>;
};

const FanSessionContext = createContext<FanSession | null>(null);

function useFanSessionState(): FanSession {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const ensureProfile = useMutation(api.profiles.ensureProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const canLoadProfile = isAuthenticated && !isLoading;

  useEffect(() => {
    if (!canLoadProfile) {
      return;
    }
    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) {
          setProfileEnsured(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileEnsured(true);
        }
      });
    return () => {
      cancelled = true;
      setProfileEnsured(false);
    };
  }, [canLoadProfile, ensureProfile]);

  const profileReady = canLoadProfile && profileEnsured;
  const viewer = useQuery(
    api.profiles.getMe,
    isAuthenticated && profileReady ? {} : "skip"
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    isSessionLoading: isLoading,
    isAuthenticated,
    isViewerReady: isAuthenticated && profileReady && viewer !== undefined,
    displayName: viewer?.displayName ?? "",
    genres: viewer?.genres ?? [],
    followCount: viewer?.followCount ?? 0,
    hasCompletedOnboarding: viewer?.hasCompletedOnboarding ?? false,
    onboardingStep: viewer?.onboardingStep ?? "genres",
    isSigningOut,
    handleSignOut,
  };
}

export function FanSessionProvider({ children }: { children: ReactNode }) {
  const session = useFanSessionState();
  return createElement(
    FanSessionContext.Provider,
    { value: session },
    children
  );
}

export function useFanSession(): FanSession {
  const session = useContext(FanSessionContext);
  if (session === null) {
    throw new Error("useFanSession must be used under FanSessionProvider");
  }
  return session;
}
