import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useConvex } from "convex/react";
import {
  type AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
} from "expo-audio";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface PreviewTrack {
  trackId: string;
  title: string;
  artistName: string;
}

interface PreviewPlayerValue {
  track: PreviewTrack;
  isPlaying: boolean;
  play: (track: PreviewTrack) => void;
  toggle: () => void;
}

const PreviewPlayerContext = createContext<PreviewPlayerValue | null>(null);

const STAND_IN: PreviewTrack = {
  trackId: "stand-in",
  title: "Asase",
  artistName: "Amaara Mensah",
};

export function PreviewPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convex = useConvex();
  const [audio] = useState(() =>
    createAudioPlayer(null, { keepAudioSessionActive: true })
  );
  const nativePlaying = useAudioPlayerStatus(audio).playing;
  const [track, setTrack] = useState<PreviewTrack>(STAND_IN);
  const [isPlaying, setIsPlaying] = useState(false);
  const loadedId = useRef<string | null>(null);
  const request = useRef(0);
  const sawNativeStatus = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
    return () => {
      audio.clearLockScreenControls();
      audio.remove();
    };
  }, [audio]);

  useEffect(() => {
    if (!sawNativeStatus.current) {
      sawNativeStatus.current = true;
      return;
    }
    setIsPlaying(nativePlaying);
  }, [nativePlaying]);

  const start = (next: PreviewTrack, player: AudioPlayer) => {
    const ticket = request.current + 1;
    request.current = ticket;
    void convex
      .query(api.tracks.playbackUrl, {
        trackId: next.trackId as Id<"tracks">,
      })
      .then((row) => {
        if (ticket !== request.current) {
          return;
        }
        if (row === null) {
          setIsPlaying(false);
          return;
        }
        player.replace({ uri: row.audioUrl });
        player.setActiveForLockScreen(
          true,
          {
            title: row.title,
            artist: row.artistName,
            artworkUrl: row.artworkUrl ?? undefined,
          },
          { showSeekForward: true, showSeekBackward: true }
        );
        loadedId.current = next.trackId;
        player.play();
      })
      .catch(() => {
        if (ticket === request.current) {
          setIsPlaying(false);
        }
      });
  };

  const play = (next: PreviewTrack) => {
    if (next.trackId === STAND_IN.trackId) {
      return;
    }
    if (next.trackId === track.trackId && loadedId.current === next.trackId) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }
    setTrack(next);
    setIsPlaying(true);
    start(next, audio);
  };

  const toggle = () => {
    play(track);
  };

  return (
    <PreviewPlayerContext.Provider value={{ track, isPlaying, play, toggle }}>
      {children}
    </PreviewPlayerContext.Provider>
  );
}

export function usePreviewPlayer(): PreviewPlayerValue {
  const value = useContext(PreviewPlayerContext);
  if (value === null) {
    throw new Error("Preview player is missing");
  }
  return value;
}
