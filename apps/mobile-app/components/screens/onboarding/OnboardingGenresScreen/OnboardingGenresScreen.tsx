import React from "react";
import { type Genre, GENRES, ONBOARDING_MIN_GENRES } from "shared";

import { useAppInsets } from "@/hooks";

import GenreTile from "../../../onboarding/GenreTile/GenreTile";
import OnboardingContinueBar from "../../../onboarding/OnboardingContinueBar/OnboardingContinueBar";
import OnboardingHeader from "../../../onboarding/OnboardingHeader/OnboardingHeader";
import { ONBOARDING_PROGRESS_BAND } from "../../../onboarding/OnboardingProgress/OnboardingProgress";
import ScrollableStack from "../../../ui/ScrollableStack/ScrollableStack";
import { HStack, VStack } from "../../../ui/Stack/Stack";

interface OnboardingGenresScreenProps {
  selectedGenres: string[];
  onToggleGenre: (genre: Genre) => void;
  onContinue: () => void;
}

const OnboardingGenresScreen: React.FC<OnboardingGenresScreenProps> = ({
  selectedGenres,
  onToggleGenre,
  onContinue,
}) => {
  const insets = useAppInsets();
  const selected = new Set(selectedGenres);
  const canContinue = selected.size >= ONBOARDING_MIN_GENRES;

  return (
    <VStack className="flex-1">
      <VStack
        spacing="lg"
        paddingX="lg"
        style={{ paddingTop: insets.top + ONBOARDING_PROGRESS_BAND }}
      >
        <OnboardingHeader
          title="What do you listen to?"
          subtitle="Pick a few genres to start."
        />
      </VStack>
      <ScrollableStack
        padding="none"
        paddingX="lg"
        paddingY="md"
        contentContainerStyle={{ paddingBottom: insets.bottom + 228 }}
      >
        <HStack spacing="sm" className="flex-wrap">
          {GENRES.map((genre) => (
            <GenreTile
              key={genre}
              genre={genre}
              selected={selected.has(genre)}
              onPress={() => {
                onToggleGenre(genre);
              }}
            />
          ))}
        </HStack>
      </ScrollableStack>
      <OnboardingContinueBar disabled={!canContinue} onPress={onContinue} />
    </VStack>
  );
};

export default OnboardingGenresScreen;
