import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import Button from "../../../ui/Button/Button";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface LockedTrackScreenProps {
  title: string;
  artistName: string;
  artworkUrl: string | null;
  onClose: () => void;
  onOpenPaywall: () => void;
}

const LockedTrackScreen: React.FC<LockedTrackScreenProps> = ({
  title,
  artistName,
  artworkUrl,
  onClose,
  onOpenPaywall,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();
  const artSize = Math.max(width - 48, 0);

  return (
    <VStack className="flex-1 bg-page" style={{ paddingTop: insets.top }}>
      <HStack justify="between" align="center" className="px-6 pb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onClose}
          className="h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <Ionicons name="chevron-back" size={16} color={COLORS.text} />
        </Pressable>
      </HStack>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <VStack spacing="lg">
          <VStack
            className="overflow-hidden rounded-3xl"
            style={{ width: artSize, height: artSize }}
          >
            {artworkUrl !== null && artworkUrl.length > 0 ? (
              <Image
                source={{ uri: artworkUrl }}
                blurRadius={12}
                contentFit="cover"
                style={{ width: artSize, height: artSize }}
              />
            ) : (
              <VStack className="flex-1 bg-surface" />
            )}
            <VStack
              align="center"
              justify="center"
              className="absolute inset-0 bg-page/45"
            >
              <VStack
                align="center"
                justify="center"
                className="h-16 w-16 rounded-full border border-white/10 bg-page/70"
              >
                <Ionicons name="lock-closed" size={22} color={COLORS.primary} />
              </VStack>
            </VStack>
            <Text className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 font-app-bold text-[10px] uppercase tracking-wide text-page">
              Supporters only
            </Text>
          </VStack>
          <VStack spacing="xs">
            <Text
              className="font-display-bold text-2xl tracking-tight text-text"
              numberOfLines={1}
            >
              {title}
            </Text>
            <HStack spacing="xs" align="center">
              <PersonAvatar displayName={artistName} size={20} />
              <Text className="text-sm text-text/60" numberOfLines={1}>
                {artistName}
              </Text>
              <Text className="text-xs text-text/30">·</Text>
              <Ionicons name="lock-closed" size={10} color={COLORS.primary} />
              <Text className="text-xs text-text/40">Supporters only</Text>
            </HStack>
          </VStack>
          <VStack
            spacing="md"
            align="center"
            className="rounded-3xl bg-surface px-6 py-6"
          >
            <VStack
              align="center"
              justify="center"
              className="h-14 w-14 rounded-full bg-primary/10"
            >
              <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
            </VStack>
            <VStack spacing="xs" align="center">
              <Text className="font-app-semibold text-base text-text">
                This is for supporters
              </Text>
              <Text className="max-w-[260px] text-center text-sm text-text/50">
                {`${artistName} shares early demos, stems and behind-the-scenes updates only with their supporters.`}
              </Text>
            </VStack>
            <VStack spacing="sm" className="mt-2 w-full">
              <Button
                text={`Support ${artistName}`}
                fullWidth
                className="rounded-full"
                onPress={onOpenPaywall}
              />
              <Button
                text="See plans"
                variant="outline"
                fullWidth
                className="rounded-full"
                onPress={onOpenPaywall}
              />
            </VStack>
          </VStack>
          <VStack spacing="sm">
            <Text className="font-app-semibold text-sm text-text">
              About this release
            </Text>
            <Text className="text-sm leading-relaxed text-text/15">
              The note for this release stays with supporters. The words here
              are only a cover so the page keeps its shape.
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default LockedTrackScreen;
