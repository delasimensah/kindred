import React from "react";

import ExpandablePhoto from "../../feed/ExpandablePhoto/ExpandablePhoto";
import LockedUpdateShell from "../../feed/LockedUpdateShell/LockedUpdateShell";
import VoiceNoteChip from "../../feed/VoiceNoteChip/VoiceNoteChip";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ArtistUpdateCardProps {
  artistName: string;
  whenLabel: string;
  audienceLabel: string;
  body: string | null;
  locked: boolean;
  photoUrl?: string | null;
  voiceDurationMs?: number | null;
  voicePlaying?: boolean;
  canPlayVoice?: boolean;
  voicePeaks?: number[];
  voiceProgress?: number;
  onToggleVoice?: () => void;
  onSeekVoice?: (ratio: number) => void;
  onSupport: () => void;
}

const ArtistUpdateCard: React.FC<ArtistUpdateCardProps> = ({
  artistName,
  whenLabel,
  audienceLabel,
  body,
  locked,
  photoUrl = null,
  voiceDurationMs = null,
  voicePlaying = false,
  canPlayVoice = false,
  voicePeaks = [],
  voiceProgress = 0,
  onToggleVoice,
  onSeekVoice,
  onSupport,
}) => {
  const meta =
    voiceDurationMs !== null && !locked
      ? `${whenLabel} · Voice note`
      : `${whenLabel} · ${audienceLabel}`;

  return (
    <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
      <Text className="text-xs text-text/40">{meta}</Text>
      {locked ? (
        <LockedUpdateShell artistName={artistName} onSupport={onSupport} />
      ) : (
        <>
          {body ? <Text className="text-sm text-text/80">{body}</Text> : null}
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
              onToggle={() => {
                onToggleVoice?.();
              }}
              onSeek={onSeekVoice}
            />
          ) : null}
        </>
      )}
    </VStack>
  );
};

export default ArtistUpdateCard;
