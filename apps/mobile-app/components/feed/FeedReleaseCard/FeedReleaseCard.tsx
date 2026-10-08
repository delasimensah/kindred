import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";
import { formatDuration } from "@/utils";

import CoverImage from "../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import FeedAuthorRow from "../FeedAuthorRow/FeedAuthorRow";
import LockedUpdateShell from "../LockedUpdateShell/LockedUpdateShell";

interface FeedReleaseCardProps {
  artistName: string;
  avatarUrl: string | null;
  meta: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  isPlaying: boolean;
  onOpenArtist: () => void;
  onPlay: () => void;
  onSupport: () => void;
}

const FeedReleaseCard: React.FC<FeedReleaseCardProps> = ({
  artistName,
  avatarUrl,
  meta,
  title,
  artworkUrl,
  durationMs,
  locked,
  isPlaying,
  onOpenArtist,
  onPlay,
  onSupport,
}) => {
  const playing = isPlaying && !locked;
  const label = playing ? `Pause ${title}` : `Play ${title}`;

  return (
    <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
      <FeedAuthorRow
        name={artistName}
        avatarUrl={avatarUrl}
        meta={meta}
        onPress={onOpenArtist}
      />
      {locked ? (
        <LockedUpdateShell
          artistName={artistName}
          noun="track"
          onSupport={onSupport}
        />
      ) : (
        <HStack
          spacing="sm"
          align="center"
          className="rounded-xl bg-page p-2.5"
        >
          <CoverImage uri={artworkUrl} width={48} height={48} radius={6} />
          <VStack spacing="none" className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-text" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-text/40">
              {formatDuration(durationMs)}
            </Text>
          </VStack>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPlay}
          >
            <HStack
              spacing="none"
              align="center"
              justify="center"
              className={`h-10 w-10 rounded-full ${
                playing ? "bg-primary" : "bg-text/10"
              }`}
            >
              <Ionicons
                name={playing ? "pause" : "play"}
                size={14}
                color={playing ? COLORS.textOnPrimary : COLORS.text}
              />
            </HStack>
          </Pressable>
        </HStack>
      )}
    </VStack>
  );
};

export default FeedReleaseCard;
