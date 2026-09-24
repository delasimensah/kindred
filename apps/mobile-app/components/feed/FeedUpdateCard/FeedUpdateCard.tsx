import React from "react";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import ExpandablePhoto from "../ExpandablePhoto/ExpandablePhoto";
import FeedAuthorRow from "../FeedAuthorRow/FeedAuthorRow";
import LockedUpdateShell from "../LockedUpdateShell/LockedUpdateShell";
import VoiceNoteChip from "../VoiceNoteChip/VoiceNoteChip";

interface FeedUpdateCardProps {
  artistName: string;
  avatarUrl: string | null;
  meta: string;
  body: string | null;
  locked: boolean;
  photoUrl?: string | null;
  voiceDurationMs: number | null;
  canPlayVoice: boolean;
  voicePlaying: boolean;
  voicePeaks?: number[];
  voiceProgress?: number;
  onOpenArtist: () => void;
  onSupport: () => void;
  onToggleVoice: () => void;
  onSeekVoice?: (ratio: number) => void;
}

const FeedUpdateCard: React.FC<FeedUpdateCardProps> = ({
  artistName,
  avatarUrl,
  meta,
  body,
  locked,
  photoUrl = null,
  voiceDurationMs,
  canPlayVoice,
  voicePlaying,
  voicePeaks = [],
  voiceProgress = 0,
  onOpenArtist,
  onSupport,
  onToggleVoice,
  onSeekVoice,
}) => {
  return (
    <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
      <FeedAuthorRow
        name={artistName}
        avatarUrl={avatarUrl}
        meta={meta}
        onPress={onOpenArtist}
      />
      {locked ? (
        <LockedUpdateShell artistName={artistName} onSupport={onSupport} />
      ) : (
        <>
          {body ? (
            <Text className="text-sm leading-relaxed text-text/80">{body}</Text>
          ) : null}
          {photoUrl ? (
            <ExpandablePhoto
              uri={photoUrl}
              label={`Photo from ${artistName}`}
            />
          ) : null}
          {voiceDurationMs !== null ? (
            <VoiceNoteChip
              durationMs={voiceDurationMs}
              isPlaying={voicePlaying}
              canPlay={canPlayVoice}
              peaks={voicePeaks}
              progress={voiceProgress}
              onToggle={onToggleVoice}
              onSeek={onSeekVoice}
            />
          ) : null}
        </>
      )}
    </VStack>
  );
};

export default FeedUpdateCard;
