import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { type Genre } from "shared";

import { OnboardingGenresScreen } from "@/components";
import { useFanSession } from "@/hooks";

const OnboardingGenresRoute = () => {
  const router = useRouter();
  const { genres } = useFanSession();
  const setGenres = useMutation(api.profiles.setGenres);

  const handleToggle = (genre: Genre) => {
    const next = genres.includes(genre)
      ? genres.filter((item) => item !== genre)
      : [...genres, genre];
    void setGenres({ genres: next });
  };

  return (
    <OnboardingGenresScreen
      selectedGenres={genres}
      onToggleGenre={handleToggle}
      onContinue={() => {
        router.push("/(onboarding)/follow-artists" as Href);
      }}
    />
  );
};

export default OnboardingGenresRoute;
