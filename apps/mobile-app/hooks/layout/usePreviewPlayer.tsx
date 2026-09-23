import React, { createContext, useContext, useState } from "react";

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
  const [track, setTrack] = useState<PreviewTrack>(STAND_IN);
  const [isPlaying, setIsPlaying] = useState(true);

  const play = (next: PreviewTrack) => {
    if (next.trackId === track.trackId) {
      setIsPlaying((playing) => !playing);
      return;
    }
    setTrack(next);
    setIsPlaying(true);
  };

  const toggle = () => {
    setIsPlaying((playing) => !playing);
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
