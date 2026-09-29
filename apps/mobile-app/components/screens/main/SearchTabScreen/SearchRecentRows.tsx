import { Ionicons } from "@expo/vector-icons";
import { Pressable, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";
import type { RecentSearchItem } from "@/hooks";

import CoverImage from "../../../ui/CoverImage/CoverImage";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export function RecentSearchRow({
  item,
  isPlaying,
  onOpen,
  onForget,
}: {
  item: RecentSearchItem;
  isPlaying: boolean;
  onOpen: () => void;
  onForget: () => void;
}) {
  const title = item.kind === "artist" ? item.name : item.title;
  const openLabel =
    item.kind === "artist"
      ? `Open ${item.name}`
      : isPlaying
        ? `Pause ${item.title}`
        : `Play ${item.title}`;

  return (
    <HStack spacing="sm" align="center" className="rounded-2xl bg-surface p-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={openLabel}
        onPress={onOpen}
        style={{ flex: 1, minWidth: 0 }}
      >
        {item.kind === "artist" ? (
          <HStack spacing="sm" align="center">
            <PersonAvatar
              displayName={item.name}
              imageUrl={item.avatarUrl}
              size={56}
            />
            <VStack spacing="none" className="min-w-0 flex-1">
              <Text
                className="font-app-semibold text-[15px] text-text"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-xs text-text/50" numberOfLines={1}>
                {item.detail}
              </Text>
            </VStack>
          </HStack>
        ) : (
          <HStack spacing="sm" align="center">
            <CoverImage
              uri={item.artworkUrl}
              width={48}
              height={48}
              radius={12}
            />
            <VStack spacing="none" className="min-w-0 flex-1">
              <Text
                className={
                  isPlaying
                    ? "font-app-medium text-sm text-primary"
                    : "font-app-medium text-sm text-text"
                }
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text className="mt-0.5 text-xs text-text/50" numberOfLines={1}>
                {item.artistName} · Track
              </Text>
            </VStack>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={14}
                color={COLORS.textOnPrimary}
                style={isPlaying ? undefined : { marginLeft: 2 }}
              />
            </View>
          </HStack>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${title} from recent searches`}
        onPress={onForget}
      >
        <Ionicons name="close" size={16} color={`${COLORS.text}66`} />
      </Pressable>
    </HStack>
  );
}

export function RecentSearchesSkeleton() {
  const { width } = useWindowDimensions();
  const text = Math.max(96, width - 48 - 24 - 56 - 16 - 32);

  return (
    <VStack spacing="sm" testID="recent-search-skeleton">
      <HStack spacing="sm" align="center" justify="between">
        <SkeletonCard width={64} height={12} radius={4} />
        <SkeletonCard width={40} height={12} radius={4} />
      </HStack>
      <HStack
        spacing="sm"
        align="center"
        className="rounded-2xl bg-surface p-3"
      >
        <SkeletonCard width={56} height={56} radius={28} tone="page" />
        <VStack spacing="xs" className="min-w-0 flex-1">
          <SkeletonCard
            width={text * 0.62}
            height={15}
            radius={4}
            tone="page"
          />
          <SkeletonCard
            width={text * 0.44}
            height={12}
            radius={4}
            tone="page"
          />
        </VStack>
        <SkeletonCard width={16} height={16} radius={8} tone="page" />
      </HStack>
      {[0.72, 0.48].map((share) => (
        <HStack
          key={share}
          spacing="sm"
          align="center"
          className="rounded-2xl bg-surface p-3"
        >
          <SkeletonCard width={48} height={48} radius={12} tone="page" />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard
              width={text * share}
              height={14}
              radius={4}
              tone="page"
            />
            <SkeletonCard
              width={text * 0.38}
              height={12}
              radius={4}
              tone="page"
            />
          </VStack>
          <SkeletonCard width={36} height={36} radius={18} tone="page" />
          <SkeletonCard width={16} height={16} radius={8} tone="page" />
        </HStack>
      ))}
    </VStack>
  );
}
