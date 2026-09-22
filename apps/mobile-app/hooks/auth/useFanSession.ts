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
  const [profileReady, setProfileReady] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setProfileReady(false);
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
  }, [ensureProfile, isAuthenticated, isLoading]);

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
