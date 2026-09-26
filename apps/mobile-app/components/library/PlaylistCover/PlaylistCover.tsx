import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { COLORS } from "@/constants";

import CoverImage from "../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../ui/Stack/Stack";

const GAP = 2;

interface PlaylistCoverProps {
  urls: string[];
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({
  urls,
  size = 64,
  width,
  height,
  radius: radiusProp,
  icon = "musical-notes",
}) => {
  const art = urls.slice(0, 4);
  const coverWidth = width ?? size;
  const coverHeight = height ?? size;
  const halfWidth = (coverWidth - GAP) / 2;
  const halfHeight = (coverHeight - GAP) / 2;
  const radius =
    radiusProp ?? (Math.min(coverWidth, coverHeight) >= 120 ? 16 : 12);
  const compact = coverHeight < 200;
  const frame = {
    width: coverWidth,
    height: coverHeight,
    borderRadius: radius,
    backgroundColor: compact ? COLORS.page : COLORS.surface,
  };

  if (art.length === 0) {
    return (
      <VStack
        spacing="none"
        align="center"
        justify="center"
        accessibilityLabel="Playlist cover"
        style={frame}
      >
        <Ionicons
          name={icon}
          size={Math.round(Math.min(coverWidth, coverHeight) * 0.28)}
          color={COLORS.primary}
        />
      </VStack>
    );
  }

  if (art.length === 1) {
    return (
      <CoverImage
        uri={art[0]}
        width={coverWidth}
        height={coverHeight}
        radius={radius}
      />
    );
  }

  if (art.length === 2) {
    return (
      <HStack
        spacing="none"
        className="overflow-hidden"
        style={{ ...frame, gap: GAP }}
      >
        <CoverTile uri={art[0]} width={halfWidth} height={coverHeight} />
        <CoverTile uri={art[1]} width={halfWidth} height={coverHeight} />
      </HStack>
    );
  }

  if (art.length === 3) {
    return (
      <HStack
        spacing="none"
        className="overflow-hidden"
        style={{ ...frame, gap: GAP }}
      >
        <CoverTile uri={art[0]} width={halfWidth} height={coverHeight} />
        <VStack spacing="none" style={{ gap: GAP }}>
          <CoverTile uri={art[1]} width={halfWidth} height={halfHeight} />
          <CoverTile uri={art[2]} width={halfWidth} height={halfHeight} />
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack
      spacing="none"
      className="overflow-hidden"
      style={{ ...frame, gap: GAP }}
    >
      <HStack spacing="none" style={{ gap: GAP }}>
        <CoverTile uri={art[0]} width={halfWidth} height={halfHeight} />
        <CoverTile uri={art[1]} width={halfWidth} height={halfHeight} />
      </HStack>
      <HStack spacing="none" style={{ gap: GAP }}>
        <CoverTile uri={art[2]} width={halfWidth} height={halfHeight} />
        <CoverTile uri={art[3]} width={halfWidth} height={halfHeight} />
      </HStack>
    </VStack>
  );
};

const CoverTile: React.FC<{ uri: string; width: number; height: number }> = ({
  uri,
  width,
  height,
}) => {
  return <CoverImage uri={uri} width={width} height={height} />;
};

export default PlaylistCover;
