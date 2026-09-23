import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";

import SkeletonCard from "../SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../Stack/Stack";
import Text from "../Text/Text";

interface CollectionEmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Same shape as the empty screen, so the real copy does not jump in. */
  isLoading?: boolean;
  /** A section inside a page. A whole screen centers in the open area. */
  compact?: boolean;
}

const CollectionEmptyState: React.FC<CollectionEmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  isLoading = false,
  compact = false,
}) => {
  const { height } = useWindowDimensions();
  const showAction =
    actionLabel !== undefined &&
    actionLabel.length > 0 &&
    (isLoading || onAction !== undefined);
  const iconSize = compact ? 56 : 80;

  return (
    <VStack
      spacing="lg"
      align="center"
      justify="center"
      className={compact ? "px-4 py-6" : "flex-1 px-8"}
      style={compact ? undefined : { minHeight: Math.round(height * 0.55) }}
    >
      {isLoading ? (
        <SkeletonCard
          width={iconSize}
          height={iconSize}
          radius={iconSize / 2}
        />
      ) : (
        <VStack
          spacing="none"
          align="center"
          justify="center"
          className={
            compact
              ? "h-14 w-14 rounded-full bg-surface"
              : "h-20 w-20 rounded-full bg-surface"
          }
        >
          <Ionicons
            name={icon}
            size={compact ? 22 : 30}
            color={COLORS.primary}
            style={{ opacity: 0.7 }}
          />
        </VStack>
      )}
      <VStack spacing="sm" align="center" className="max-w-[240px]">
        {isLoading ? (
          <>
            <SkeletonCard width={148} height={18} radius={6} />
            <SkeletonCard width={200} height={12} radius={6} />
          </>
        ) : (
          <>
            <Text className="text-center font-app-semibold text-lg text-text">
              {title}
            </Text>
            <Text className="text-center text-sm leading-5 text-text/40">
              {subtitle}
            </Text>
          </>
        )}
      </VStack>
      {showAction && isLoading ? (
        <SkeletonCard width={168} height={44} radius={22} />
      ) : null}
      {showAction && !isLoading ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
        >
          <HStack
            spacing="sm"
            align="center"
            justify="center"
            className="rounded-full bg-primary px-6 py-3.5"
          >
            <Ionicons name="add" size={14} color={COLORS.textOnPrimary} />
            <Text className="font-app-semibold text-sm text-textOnPrimary">
              {actionLabel}
            </Text>
          </HStack>
        </Pressable>
      ) : null}
    </VStack>
  );
};

export default CollectionEmptyState;
