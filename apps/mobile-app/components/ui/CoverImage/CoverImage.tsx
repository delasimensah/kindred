import { Image, type ImageContentFit } from "expo-image";
import React from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";

import { COLORS } from "@/constants";

interface CoverImageProps {
  uri: string | null | undefined;
  width: number;
  height: number;
  radius?: number;
  accessibilityLabel?: string;
  opacity?: number;
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
}

/**
 * Remote cover/photo with a dark surface fill so empty space never flashes
 * while the image loads or when there is no url.
 */
const CoverImage: React.FC<CoverImageProps> = ({
  uri,
  width,
  height,
  radius = 0,
  accessibilityLabel = "",
  opacity = 1,
  contentFit = "cover",
  style,
}) => {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: COLORS.surface,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          accessibilityLabel=""
          source={{ uri }}
          contentFit={contentFit}
          style={{
            width,
            height,
            backgroundColor: COLORS.surface,
            opacity,
          }}
        />
      ) : null}
    </View>
  );
};

export default CoverImage;
