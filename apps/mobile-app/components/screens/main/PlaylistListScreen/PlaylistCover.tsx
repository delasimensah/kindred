import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../../ui/Stack/Stack";

const SIZE = 64;
const HALF = 31;
const GAP = 2;

interface PlaylistCoverProps {
  urls: string[];
}

const tileStyle = {
  backgroundColor: COLORS.page,
};

const PlaylistCover: React.FC<PlaylistCoverProps> = ({ urls }) => {
  const art = urls.slice(0, 4);

  if (art.length === 0) {
    return (
      <VStack
        spacing="none"
        align="center"
        justify="center"
        className="h-16 w-16 rounded-xl bg-page"
      >
        <Ionicons name="musical-notes" size={22} color={COLORS.primary} />
      </VStack>
    );
  }

  if (art.length === 1) {
    return (
      <Image
        accessibilityLabel=""
        source={{ uri: art[0] }}
        contentFit="cover"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 12,
          backgroundColor: COLORS.surface,
        }}
      />
    );
  }

  if (art.length === 2) {
    return (
      <HStack
        spacing="none"
        className="h-16 w-16 overflow-hidden rounded-xl"
        style={{ gap: GAP }}
      >
        <CoverTile uri={art[0]} width={HALF} height={SIZE} />
        <CoverTile uri={art[1]} width={HALF} height={SIZE} />
      </HStack>
    );
  }

  if (art.length === 3) {
    return (
      <HStack
        spacing="none"
        className="h-16 w-16 overflow-hidden rounded-xl"
        style={{ gap: GAP }}
      >
        <CoverTile uri={art[0]} width={HALF} height={SIZE} />
        <VStack spacing="none" style={{ gap: GAP }}>
          <CoverTile uri={art[1]} width={HALF} height={HALF} />
          <CoverTile uri={art[2]} width={HALF} height={HALF} />
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack
      spacing="none"
      className="h-16 w-16 overflow-hidden rounded-xl"
      style={{ gap: GAP }}
    >
      <HStack spacing="none" style={{ gap: GAP }}>
        <CoverTile uri={art[0]} width={HALF} height={HALF} />
        <CoverTile uri={art[1]} width={HALF} height={HALF} />
      </HStack>
      <HStack spacing="none" style={{ gap: GAP }}>
        <CoverTile uri={art[2]} width={HALF} height={HALF} />
        <CoverTile uri={art[3]} width={HALF} height={HALF} />
      </HStack>
    </VStack>
  );
};

const CoverTile: React.FC<{ uri: string; width: number; height: number }> = ({
  uri,
  width,
  height,
}) => {
  return (
    <Image
      accessibilityLabel=""
      source={{ uri }}
      contentFit="cover"
      style={{ width, height, ...tileStyle }}
    />
  );
};

export default PlaylistCover;
