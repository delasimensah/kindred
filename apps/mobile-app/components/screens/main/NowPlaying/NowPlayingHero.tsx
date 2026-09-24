import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

import { COLORS } from "@/constants";
import { showLikedToast } from "@/utils";

import TrackMenu from "../../../catalog/TrackMenu/TrackMenu";
import { HStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface NowPlayingHeroProps {
  title: string;
  trackId: string;
  artworkUrl: string | null;
  height: number;
  paddingTop: number;
  canLike: boolean;
  liked: boolean;
  onClose: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  onToggleLike: (liked: boolean) => void;
}

const NowPlayingHero: React.FC<NowPlayingHeroProps> = ({
  title,
  trackId,
  artworkUrl,
  height,
  paddingTop,
  canLike,
  liked,
  onClose,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
}) => {
  return (
    <View style={{ height, backgroundColor: COLORS.surface }}>
      {artworkUrl ? (
        <Image
          accessibilityLabel="Album artwork"
          source={{ uri: artworkUrl }}
          contentFit="cover"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.surface,
          }}
        />
      ) : (
        <View
          accessibilityLabel="Album artwork"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.surface,
          }}
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(34,40,49,0.2)", COLORS.page]}
        locations={[0.45, 0.72, 1]}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <HStack
        align="center"
        justify="between"
        className="px-6"
        style={{ paddingTop }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close player"
          onPress={onClose}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          <Ionicons name="chevron-down" size={20} color={COLORS.text} />
        </Pressable>
        <Text className="font-app-semibold text-sm text-text">Now playing</Text>
        {canLike ? (
          <TrackMenu
            title={title}
            trackId={trackId}
            artworkUrl={artworkUrl}
            liked={liked}
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
            filled
            onToggleLike={() => {
              onToggleLike(!liked);
              showLikedToast(!liked);
            }}
          />
        ) : (
          <View className="h-11 w-11" />
        )}
      </HStack>
    </View>
  );
};

export default NowPlayingHero;
