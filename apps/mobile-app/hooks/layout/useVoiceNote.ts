import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";

/**
 * A short spoken clip beside the music player. useAudioPlayer releases the
 * player when the screen unmounts. seekTo moves within the loaded clip.
 * https://docs.expo.dev/versions/v57.0.0/sdk/audio/
 */
export function useVoiceNote() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [held, setHeld] = useState<{ url: string; ratio: number } | null>(null);
  const pendingRatio = useRef<number | null>(null);

  useEffect(() => {
    const ratio = pendingRatio.current;
    if (ratio === null || !(status.duration > 0)) {
      return;
    }
    pendingRatio.current = null;
    void player.seekTo(ratio * status.duration).then(() => {
      player.play();
    });
  }, [player, status.duration]);

  if (
    held !== null &&
    activeUrl === held.url &&
    status.duration > 0 &&
    Math.abs(status.currentTime / status.duration - held.ratio) < 0.03
  ) {
    setHeld(null);
  }

  const toggle = (url: string, onStart?: () => void) => {
    if (activeUrl === url && status.playing) {
      player.pause();
      return;
    }
    if (activeUrl === url) {
      onStart?.();
      player.play();
      return;
    }
    onStart?.();
    const remembered =
      held?.url === url && held.ratio > 0.001 ? held.ratio : null;
    pendingRatio.current = remembered;
    setActiveUrl(url);
    player.replace({ uri: url });
    if (remembered === null) {
      player.play();
    }
  };

  const seek = (url: string, ratio: number) => {
    const clamped = Math.min(1, Math.max(0, ratio));
    if (activeUrl === url && status.duration > 0) {
      const keepPlaying = status.playing;
      setHeld(null);
      void Promise.resolve(player.seekTo(clamped * status.duration)).then(
        () => {
          if (keepPlaying) {
            player.play();
          }
        }
      );
      return;
    }
    setHeld({ url, ratio: clamped });
  };

  const progress =
    activeUrl !== null && status.duration > 0
      ? status.currentTime / status.duration
      : 0;

  return {
    playingUrl: status.playing ? activeUrl : null,
    activeUrl,
    heldUrl: held?.url ?? null,
    heldRatio: held?.ratio ?? 0,
    progress,
    toggle,
    seek,
  };
}
