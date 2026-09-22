import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";

import { OnboardingFollowArtistsScreen } from "@/components";
import { useFanSession } from "@/hooks";

const OnboardingFollowArtistsRoute = () => {
  const router = useRouter();
  const { followCount } = useFanSession();
  const artists = useQuery(api.artists.listForOnboarding, {});
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);
  const completeOnboarding = useMutation(api.profiles.completeOnboarding);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (artistId: string) => {
    const row = artists?.find((artist) => artist.artistId === artistId);
    if (row === undefined) {
      return;
    }
    setIsSaving(true);
    try {
      if (row.isFollowed) {
        await removeFollow({ artistId: artistId as Id<"artists"> });
      } else {
        await addFollow({ artistId: artistId as Id<"artists"> });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await completeOnboarding({});
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(onboarding)/genres" as Href);
  };

  return (
    <OnboardingFollowArtistsScreen
      artists={artists ?? []}
      followCount={followCount}
      isSaving={isSaving}
      onBack={goBack}
      onToggleFollow={(artistId) => {
        void handleToggle(artistId);
      }}
      onContinue={() => {
        void handleContinue();
      }}
    />
  );
};

export default OnboardingFollowArtistsRoute;
