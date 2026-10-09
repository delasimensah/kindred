"use client";

import { IconPlayerPlay } from "@tabler/icons-react";
import React from "react";

import { stagger } from "../../public/motion";
import type { PublicTrackItem } from "../../public/publicCatalog";
import { displayPositions, playableTracks } from "../../public/publicCatalog";
import { Artwork } from "../../public/PublicTrackRow";
import PublicTrackRow from "../../public/PublicTrackRow";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface PublicMix {
  slug: string;
  name: string;
  why: string;
  curatorName: string;
  artworkUrl: string | null;
  tracks: PublicTrackItem[];
}

interface PublicMixPageProps {
  mix: PublicMix;
  activeTrackId: string | null;
  playing: boolean;
  onPlayTrack: (tracks: PublicTrackItem[], trackId: string) => void;
}

const PublicMixPage: React.FC<PublicMixPageProps> = ({
  mix,
  activeTrackId,
  playing,
  onPlayTrack,
}) => {
  const first = playableTracks(mix.tracks)[0];
  const positions = displayPositions(mix.tracks);
  const totalMs = mix.tracks.reduce((sum, track) => sum + track.durationMs, 0);
  const minutes = Math.round(totalMs / 60000);
  const trackCount =
    mix.tracks.length === 1 ? "1 track" : `${mix.tracks.length} tracks`;
  const lengthLabel = minutes < 1 ? "under 1 min" : `${minutes} min`;
  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mb-6 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
        <Artwork
          url={mix.artworkUrl}
          className="h-48 w-48 rounded-2xl shadow-card motion-safe:animate-pop sm:h-52 sm:w-52"
        />
        <div
          className="min-w-0 motion-safe:animate-rise"
          style={stagger(1, 90)}
        >
          <p className="mb-2 text-xs font-semibold text-primary">Mix</p>
          <Heading
            variant="page"
            className="mb-2 font-display text-3xl font-medium leading-tight lg:text-4xl"
          >
            {mix.name}
          </Heading>
          <p className="mb-4 text-sm font-medium text-text/70">
            Curated by {mix.curatorName}
          </p>
          <Text className="mb-6 max-w-md text-sm leading-relaxed text-text/60">
            {mix.why}
          </Text>
          {first !== undefined ? (
            <button
              type="button"
              aria-label={`Play ${mix.name}`}
              onClick={() => onPlayTrack(mix.tracks, first.trackId)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-textOnPrimary transition hover:brightness-95 motion-safe:active:scale-[0.97]"
            >
              <IconPlayerPlay size={12} /> Play
            </button>
          ) : (
            <Text className="text-sm text-text/50">
              These songs open in the Kindred app.
            </Text>
          )}
        </div>
      </div>
      <section
        className="mt-10 motion-safe:animate-rise"
        style={stagger(2, 90)}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <Heading variant="section" className="mb-0 text-lg font-semibold">
            Tracklist
          </Heading>
          <span className="text-sm text-text/40">
            {trackCount} · {lengthLabel}
          </span>
        </div>
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
          {mix.tracks.map((track, index) => (
            <PublicTrackRow
              key={track.trackId}
              track={track}
              position={positions[index] ?? 0}
              active={activeTrackId === track.trackId}
              playing={playing}
              detail="mix"
              onPlay={(trackId) => onPlayTrack(mix.tracks, trackId)}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default PublicMixPage;
