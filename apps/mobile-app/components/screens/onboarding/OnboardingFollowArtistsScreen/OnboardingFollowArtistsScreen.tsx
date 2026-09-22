import React from "react";
import { View } from "react-native";
import { ONBOARDING_MIN_FOLLOWS } from "shared";

import { useAppInsets } from "@/hooks";

import AuthBackButton from "../../../auth/AuthBackButton/AuthBackButton";
import FollowArtistRow from "../../../onboarding/FollowArtistRow/FollowArtistRow";
import FollowCounterPill from "../../../onboarding/FollowCounterPill/FollowCounterPill";
import OnboardingContinueBar from "../../../onboarding/OnboardingContinueBar/OnboardingContinueBar";
import OnboardingHeader from "../../../onboarding/OnboardingHeader/OnboardingHeader";
import { ONBOARDING_PROGRESS_BAND } from "../../../onboarding/OnboardingProgress/OnboardingProgress";
import ScrollableStack from "../../../ui/ScrollableStack/ScrollableStack";
import { VStack } from "../../../ui/Stack/Stack";

export type OnboardingArtist = {
  artistId: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  isFollowed: boolean;
};

interface OnboardingFollowArtistsScreenProps {
  artists: OnboardingArtist[];
  followCount: number;
  isSaving: boolean;
  onBack: () => void;
  onToggleFollow: (artistId: string) => void;
  onContinue: () => void;
}

const OnboardingFollowArtistsScreen: React.FC<
  OnboardingFollowArtistsScreenProps
> = ({
  artists,
  followCount,
  isSaving,
  onBack,
  onToggleFollow,
  onContinue,
}) => {
  const insets = useAppInsets();
  const canContinue = followCount >= ONBOARDING_MIN_FOLLOWS;

  return (
    <VStack className="flex-1">
      <VStack
        spacing="md"
        paddingX="lg"
        style={{ paddingTop: insets.top + ONBOARDING_PROGRESS_BAND }}
      >
        <AuthBackButton onPress={onBack} />
        <OnboardingHeader
          title="Follow artists"
          subtitle="Follow at least 2 to continue."
          trailing={
            <FollowCounterPill
              followCount={followCount}
              minimum={ONBOARDING_MIN_FOLLOWS}
            />
          }
        />
      </VStack>
      <ScrollableStack
        padding="none"
        paddingX="lg"
        paddingY="md"
        contentContainerStyle={{ paddingBottom: insets.bottom + 228 }}
      >
        <VStack spacing="none">
          {artists.map((artist, index) => (
            <VStack key={artist.artistId} spacing="none">
              <FollowArtistRow
                name={artist.name}
                bio={artist.bio}
                imageUrl={artist.avatarUrl}
                isFollowed={artist.isFollowed}
                onToggle={() => {
                  onToggleFollow(artist.artistId);
                }}
              />
              {index < artists.length - 1 ? (
                /* View used: divider line; do not change. */
                <View className="h-px bg-text/5" />
              ) : null}
            </VStack>
          ))}
        </VStack>
      </ScrollableStack>
      <OnboardingContinueBar
        disabled={!canContinue}
        loading={isSaving}
        onPress={onContinue}
      />
    </VStack>
  );
};

export default OnboardingFollowArtistsScreen;
