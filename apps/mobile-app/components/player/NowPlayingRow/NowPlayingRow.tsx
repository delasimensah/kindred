import { TEXT_SECONDARY_OPACITY } from "shared";

import { COLORS } from "@/constants";
import type { QueueTrack } from "@/hooks";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import QueueArtwork from "../QueueArtwork/QueueArtwork";

interface NowPlayingRowProps {
  track: QueueTrack;
  isPlaying: boolean;
}

const BAR_HEIGHTS = [8, 16, 12, 20];

const NowPlayingRow: React.FC<NowPlayingRowProps> = ({ track, isPlaying }) => {
  return (
    <HStack
      align="center"
      spacing="sm"
      className="rounded-2xl bg-surface p-2.5"
      style={{ borderWidth: 1, borderColor: COLORS.primary }}
    >
      <QueueArtwork url={track.artworkUrl} size={56} />
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text
          className="font-app-semibold text-base"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text
          className="mt-0.5 text-sm"
          style={{ color: COLORS.text, opacity: TEXT_SECONDARY_OPACITY }}
          numberOfLines={1}
        >
          {track.artistName}
        </Text>
      </VStack>
      {isPlaying ? (
        <HStack align="center" spacing="none" className="mr-1 h-5 gap-[3px]">
          {BAR_HEIGHTS.map((height) => (
            <VStack
              key={height}
              spacing="none"
              className="w-[3px] rounded-sm bg-primary"
              style={{ height }}
            />
          ))}
        </HStack>
      ) : null}
    </HStack>
  );
};

export default NowPlayingRow;
