import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import PlaylistCover from "../PlaylistCover/PlaylistCover";

export interface LibraryCollection {
  title: string;
  detail: string;
  artworkUrls: string[];
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

interface LibraryCollectionHeaderProps {
  collection: LibraryCollection;
  onPlayAll?: () => void;
}

export const COLLECTION_HERO_HEIGHT = 380;

const LibraryCollectionHeader: React.FC<LibraryCollectionHeaderProps> = ({
  collection,
  onPlayAll,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        width,
        height: COLLECTION_HERO_HEIGHT,
        backgroundColor: COLORS.surface,
      }}
    >
      <View
        style={{ position: "absolute", width, height: COLLECTION_HERO_HEIGHT }}
      >
        <PlaylistCover
          urls={collection.artworkUrls}
          width={width}
          height={COLLECTION_HERO_HEIGHT}
          radius={0}
          icon={collection.fallbackIcon}
        />
      </View>
      <LinearGradient
        colors={["transparent", "rgba(34,40,49,0.15)", COLORS.page]}
        locations={[0.4, 0.72, 1]}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <HStack
        align="end"
        justify="between"
        className="absolute bottom-5 left-0 right-0 px-6"
      >
        <VStack spacing="xs" className="min-w-0 flex-1 pr-4">
          <Text className="font-display-bold text-3xl text-text">
            {collection.title}
          </Text>
          {collection.detail.length > 0 ? (
            <Text className="text-sm text-text/70">{collection.detail}</Text>
          ) : null}
        </VStack>
        {onPlayAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play ${collection.title}`}
            onPress={onPlayAll}
            className="h-14 w-14 items-center justify-center rounded-full bg-primary"
          >
            <Ionicons name="play" size={22} color={COLORS.textOnPrimary} />
          </Pressable>
        ) : null}
      </HStack>
    </View>
  );
};

export default LibraryCollectionHeader;
