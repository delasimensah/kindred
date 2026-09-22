import { Ionicons } from "@expo/vector-icons";
import React, { type ComponentProps, useMemo } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  useReducedMotion,
  ZoomIn,
} from "react-native-reanimated";
import { type Genre, GENRE_ACCENTS } from "shared";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const GENRE_ICONS: Record<Genre, IoniconName> = {
  Afrobeats: "flame",
  Amapiano: "disc",
  Highlife: "musical-notes",
  Alté: "sparkles",
  "Afro-soul and R&B": "heart",
  "Afro-house": "home",
  "Hip-hop and Drill": "mic",
  Gospel: "sunny",
  "Bongo Flava": "play-circle",
  "Francophone Afropop": "globe",
  "Reggae and Dancehall": "leaf",
  "Jazz and Instrumental": "musical-note",
};

interface GenreTileProps {
  genre: Genre;
  selected: boolean;
  onPress: () => void;
}

const GenreTile: React.FC<GenreTileProps> = ({ genre, selected, onPress }) => {
  const reduceMotion = useReducedMotion();
  const checkEntering = useMemo(
    () => (reduceMotion ? undefined : ZoomIn.duration(180)),
    [reduceMotion]
  );
  const iconEntering = useMemo(
    () => (reduceMotion ? undefined : FadeIn.duration(200)),
    [reduceMotion]
  );
  const accent = GENRE_ACCENTS[genre];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={genre}
      onPress={onPress}
      className="w-[48%]"
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <VStack
        spacing="sm"
        justify="end"
        className="relative h-32 rounded-xl border-2"
        padding="md"
        style={{
          backgroundColor: selected ? accent.washSelected : accent.wash,
          borderColor: selected ? accent.ink : `${accent.ink}66`,
        }}
      >
        {selected ? (
          <Animated.View
            entering={checkEntering}
            className="absolute right-3 top-3"
          >
            <HStack
              spacing="none"
              align="center"
              justify="center"
              className="h-6 w-6 rounded-full bg-primary"
            >
              <Ionicons
                name="checkmark"
                size={12}
                color={COLORS.textOnPrimary}
              />
            </HStack>
          </Animated.View>
        ) : null}
        <Animated.View entering={iconEntering}>
          <Ionicons name={GENRE_ICONS[genre]} size={32} color={accent.ink} />
        </Animated.View>
        <Text
          className="font-app-semibold text-base"
          style={{ color: accent.ink }}
        >
          {genre}
        </Text>
      </VStack>
    </Pressable>
  );
};

export default GenreTile;
