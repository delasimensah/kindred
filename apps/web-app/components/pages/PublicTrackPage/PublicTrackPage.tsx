"use client";

import {
  IconLock,
  IconPlayerPause,
  IconPlayerPlay,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatVoiceDuration } from "@/utils";

import GetTheAppButton from "../../public/GetTheAppButton";
import {
  displayPositions,
  type PublicTrackItem,
} from "../../public/publicCatalog";
import { Artwork } from "../../public/PublicTrackRow";
import PublicTrackRow from "../../public/PublicTrackRow";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

interface PublicTrackPageProps {
  track: PublicTrackItem;
  description: string | null;
  publishedAt: number | null;
  artistAvatarUrl: string | null;
  more: PublicTrackItem[];
  activeTrackId: string | null;
  playing: boolean;
  onPlayTrack: (tracks: PublicTrackItem[], trackId: string) => void;
}

function releasedLabel(publishedAt: number) {
  return new Date(publishedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PublicTrackPage: React.FC<PublicTrackPageProps> = ({
  track,
  publishedAt,
  artistAvatarUrl,
  more,
  activeTrackId,
  playing,
  onPlayTrack,
}) => {
  const positions = displayPositions(more);
  const thisPlaying = activeTrackId === track.trackId && playing;
  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
      {track.locked ? (
        <section className="mb-12 rounded-2xl border border-primary/20 bg-surface p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
              <Artwork
                url={track.artworkUrl}
                dimmed
                className="h-24 w-24 rounded-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <IconLock size={18} className="text-text/80" aria-hidden />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <IconLock size={10} aria-hidden />
                Exclusive
              </p>
              <Heading variant="section" className="mb-1 text-xl">
                {track.title}
              </Heading>
              <Text className="text-sm text-text/50">
                Available for supporters in the Kindred app.
              </Text>
            </div>
            <GetTheAppButton
              label={`Get the app to hear ${track.title}`}
              iconSize={14}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary"
            />
          </div>
        </section>
      ) : (
        <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
          <Artwork
            url={track.artworkUrl}
            className="h-52 w-52 rounded-2xl sm:h-56 sm:w-56"
          />
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              {track.kindLabel}
            </p>
            <Heading
              variant="page"
              className="mb-2 font-display text-3xl font-medium leading-tight lg:text-[42px]"
            >
              {track.title}
            </Heading>
            <Link
              href={`/artist/${track.artistHandle}`}
              className="mb-6 flex w-fit items-center gap-2.5 text-sm font-medium text-text/70 hover:text-text"
            >
              <Artwork url={artistAvatarUrl} className="h-7 w-7 rounded-full" />
              {track.artistName}
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={
                  thisPlaying ? `Pause ${track.title}` : `Play ${track.title}`
                }
                onClick={() => onPlayTrack([track, ...more], track.trackId)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-textOnPrimary hover:brightness-95"
              >
                {thisPlaying ? (
                  <IconPlayerPause size={12} />
                ) : (
                  <IconPlayerPlay size={12} />
                )}
                {thisPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                aria-label="Share"
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-text/60 hover:text-text"
              >
                <IconShare size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {track.locked ? null : (
        <section className="mb-10 rounded-2xl border border-white/5 bg-surface p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
            {publishedAt !== null ? (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-text/40">
                  Released
                </p>
                <p className="text-text/80">{releasedLabel(publishedAt)}</p>
              </div>
            ) : null}
            <div>
              <p className="mb-1.5 text-xs uppercase tracking-wider text-text/40">
                Duration
              </p>
              <p className="text-text/80">
                {formatVoiceDuration(track.durationMs)}
              </p>
            </div>
          </div>
        </section>
      )}
      {more.length > 0 ? (
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <Heading variant="section" className="mb-0 text-lg font-semibold">
              More from {track.artistName}
            </Heading>
            <Link
              href={`/artist/${track.artistHandle}`}
              className="text-sm text-primary"
            >
              View artist
            </Link>
          </div>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
            {more.map((row, index) => (
              <PublicTrackRow
                key={row.trackId}
                track={row}
                position={positions[index] ?? 0}
                active={activeTrackId === row.trackId}
                playing={playing}
                detail="more"
                onPlay={(trackId) => onPlayTrack([track, ...more], trackId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default PublicTrackPage;
