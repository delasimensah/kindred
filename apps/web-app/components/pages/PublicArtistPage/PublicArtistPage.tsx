"use client";

import { IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatRelativeTime } from "@/utils";

import GetTheAppButton from "../../public/GetTheAppButton";
import type {
  PublicPostPreview,
  PublicReleaseItem,
  PublicTrackItem,
} from "../../public/publicCatalog";
import { displayPositions, playableTracks } from "../../public/publicCatalog";
import { Artwork } from "../../public/PublicTrackRow";
import PublicTrackRow from "../../public/PublicTrackRow";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface PublicArtist {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  followerCount: number;
  tracks: PublicTrackItem[];
  releases: PublicReleaseItem[];
  posts: PublicPostPreview[];
}

interface PublicArtistPageProps {
  artist: PublicArtist;
  activeTrackId: string | null;
  playing: boolean;
  onPlayTrack: (tracks: PublicTrackItem[], trackId: string) => void;
}

function followerLine(count: number) {
  const noun = count === 1 ? "follower" : "followers";
  return `${count.toLocaleString()} ${noun}`;
}

function heroMeta(artist: PublicArtist) {
  const followers = followerLine(artist.followerCount);
  if (artist.bio.length === 0 || artist.bio.length > 90) {
    return { line: followers, paragraph: artist.bio };
  }
  return { line: `${artist.bio} · ${followers}`, paragraph: "" };
}

function releaseKind(release: PublicReleaseItem) {
  const kind = release.type === "ep" ? "EP" : "Album";
  if (release.publishedAt === null) {
    return kind;
  }
  return `${kind} · ${new Date(release.publishedAt).getFullYear()}`;
}

const PublicArtistPage: React.FC<PublicArtistPageProps> = ({
  artist,
  activeTrackId,
  playing,
  onPlayTrack,
}) => {
  const firstPlayable = playableTracks(artist.tracks)[0];
  const positions = displayPositions(artist.tracks);
  const meta = heroMeta(artist);
  return (
    <div>
      <section className="relative h-64 w-full overflow-hidden sm:h-72 lg:h-[340px]">
        {artist.coverUrl !== null ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-page via-page/70 to-page/10" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-4 pb-6 sm:px-8 lg:flex-row lg:items-end lg:gap-6 lg:px-10 lg:pb-8">
          <Artwork
            url={artist.avatarUrl}
            className="h-20 w-20 rounded-2xl border-4 border-page sm:h-28 sm:w-28 lg:h-32 lg:w-32"
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Artist
            </p>
            <Heading
              variant="page"
              className="mb-0 font-display text-3xl font-medium leading-tight lg:text-[40px]"
            >
              {artist.name}
            </Heading>
            <Text className="mt-1 text-sm text-text/60">{meta.line}</Text>
          </div>
          <div className="flex items-center gap-3 pb-1">
            {firstPlayable !== undefined ? (
              <button
                type="button"
                aria-label={`Play ${artist.name}`}
                onClick={() =>
                  onPlayTrack(artist.tracks, firstPlayable.trackId)
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-text text-page"
              >
                <IconPlayerPlay size={16} className="ml-0.5" />
              </button>
            ) : null}
            <GetTheAppButton
              iconSize={14}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:px-6"
            />
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 lg:px-10 lg:py-9">
        {meta.paragraph.length > 0 ? (
          <Text className="mb-10 max-w-2xl text-sm leading-relaxed text-text/70">
            {meta.paragraph}
          </Text>
        ) : null}
        <section className="mb-12">
          <Heading variant="section" className="mb-5 text-lg font-semibold">
            Popular tracks
          </Heading>
          {artist.tracks.length === 0 ? (
            <Text className="text-sm text-text/50">
              No published tracks yet.
            </Text>
          ) : (
            <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
              {artist.tracks.map((track, index) => {
                return (
                  <PublicTrackRow
                    key={track.trackId}
                    track={track}
                    position={positions[index] ?? 0}
                    active={activeTrackId === track.trackId}
                    playing={playing}
                    onPlay={(trackId) => onPlayTrack(artist.tracks, trackId)}
                  />
                );
              })}
            </div>
          )}
        </section>
        {artist.releases.length > 0 ? (
          <section className="mb-12">
            <Heading variant="section" className="mb-5 text-lg font-semibold">
              Releases
            </Heading>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artist.releases.map((release) => {
                const first = playableTracks(release.tracks)[0];
                return (
                  <li
                    key={release.releaseId}
                    className="overflow-hidden rounded-2xl border border-white/5 bg-surface"
                  >
                    <Artwork
                      url={release.artworkUrl}
                      dimmed={release.locked}
                      className="h-40 w-full rounded-none"
                    />
                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-text">
                        {release.title}
                      </p>
                      <p className="mt-1 text-xs text-text/45">
                        {release.locked ? "Exclusive" : releaseKind(release)}
                      </p>
                      {release.locked || first === undefined ? (
                        <GetTheAppButton
                          label={`Get the app to hear ${release.title}`}
                          iconSize={12}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-textOnPrimary"
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {artist.posts.length > 0 ? (
          <section>
            <Heading variant="section" className="mb-5 text-lg font-semibold">
              Updates
            </Heading>
            <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
              {artist.posts.map((post) => (
                <li key={post.postId}>
                  <Link
                    href={`/post/${post.postId}`}
                    className="block px-4 py-4 sm:px-6"
                  >
                    <p className="text-xs text-text/45">
                      {post.locked
                        ? "Exclusive"
                        : `Public update · ${formatRelativeTime(post.createdAt)}`}
                    </p>
                    <p
                      className={`mt-1 text-sm ${post.locked ? "text-text/60" : "text-text"}`}
                    >
                      {post.locked
                        ? "Available for supporters in the Kindred app."
                        : post.preview}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default PublicArtistPage;
