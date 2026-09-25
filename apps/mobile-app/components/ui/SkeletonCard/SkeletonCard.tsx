import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

import { COLORS } from "@/constants";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface SkeletonCardProps {
  width?: number;
  height?: number;
  radius?: number;
  mt?: number;
  mb?: number;
  mr?: number;
  ml?: number;
  /** page bars sit on a surface card. surface bars sit on the page. */
  tone?: "surface" | "page";
}

/**
 * SkeletonCard - Animated shimmer loading placeholder
 * Creates smooth gradient animations for loading states
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width,
  height,
  radius,
  mt,
  mb,
  mr,
  ml,
  tone = "surface",
}) => {
  const shimmerColors =
    tone === "page"
      ? ([COLORS.page, COLORS.surface, COLORS.page] as const)
      : ([COLORS.surface, COLORS.surface, COLORS.surface] as const);
  return (
    <View testID="skeleton-card">
      <ShimmerPlaceholder
        visible={false}
        shimmerStyle={{
          borderRadius: radius || 8,
          marginTop: mt || 0,
          marginBottom: mb || 0,
          marginLeft: ml || 0,
          marginRight: mr || 0,
        }}
        shimmerColors={[...shimmerColors]}
        width={width || 100}
        height={height || 15}
      />
    </View>
  );
};

export default SkeletonCard;
