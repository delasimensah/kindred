"use client";

import { IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import GetTheAppButton from "../../public/GetTheAppButton";
import { Artwork } from "../../public/PublicTrackRow";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface BrowseArtist {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
}

export interface BrowsePlayTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
}

export interface BrowseFeatured extends BrowseArtist {
  playTrack: BrowsePlayTrack | null;
}

export interface BrowseRelease {
  title: string;
  subtitle: string;
  artworkUrl: string | null;
  href: string;
}

interface PublicBrowsePageProps {
  featured: BrowseFeatured | null;
  rising: BrowseArtist[];
  releases: BrowseRelease[];
  onPlayFeatured: () => void;
}

function genreLabel(bio: string) {
  const genre = bio.split(" · ")[0]?.trim();
  return genre !== undefined && genre.length > 0 ? genre : bio;
}

const PublicBrowsePage: React.FC<PublicBrowsePageProps> = ({
  featured,
  rising,
  releases,
  onPlayFeatured,
}) => {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:px-10 lg:py-9">
      <section className="mb-11">
        <Heading variant="section" className="mb-5 text-lg font-semibold">
          Featured
        </Heading>
        {featured === null ? (
          <Text className="text-sm text-text/50">No featured artist yet.</Text>
        ) : (
          <div className="relative h-64 overflow-hidden rounded-2xl">
            {featured.coverUrl !== null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-page/95 via-page/70 to-transparent" />
            <div className="absolute inset-0 flex max-w-lg flex-col justify-center px-6 sm:px-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Featured artist
              </p>
              <Link href={`/artist/${featured.handle}`}>
                <Heading
                  variant="card"
                  className="mb-2 font-display text-3xl font-medium"
                >
                  {featured.name}
                </Heading>
              </Link>
              <Text className="mb-5 text-sm text-text/60">{featured.bio}</Text>
              <div className="flex items-center gap-3">
                {featured.playTrack !== null ? (
                  <button
                    type="button"
                    aria-label={`Play ${featured.playTrack.title}`}
                    onClick={onPlayFeatured}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-text text-page"
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
          </div>
        )}
      </section>

      <section className="mb-11">
        <Heading variant="section" className="mb-5 text-lg font-semibold">
          Rising
        </Heading>
        {rising.length === 0 ? (
          <Text className="text-sm text-text/50">No rising artists yet.</Text>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {rising.map((artist) => (
              <li
                key={artist.handle}
                className="flex flex-col items-center rounded-2xl border border-white/5 bg-surface p-4 text-center sm:p-5"
              >
                <Link href={`/artist/${artist.handle}`} className="w-full">
                  <Artwork
                    url={artist.avatarUrl}
                    className="mx-auto mb-4 h-20 w-20 rounded-full"
                  />
                  <p className="truncate text-sm font-semibold text-text">
                    {artist.name}
                  </p>
                  <p className="mb-4 truncate text-xs text-text/45">
                    {genreLabel(artist.bio)}
                  </p>
                </Link>
                <GetTheAppButton
                  iconSize={14}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {releases.length > 0 ? (
        <section className="mb-11">
          <Heading variant="section" className="mb-5 text-lg font-semibold">
            New releases
          </Heading>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {releases.map((release) => (
              <li key={`${release.href}-${release.title}`}>
                <Link href={release.href}>
                  <Artwork
                    url={release.artworkUrl}
                    className="mb-3 h-32 w-full rounded-xl"
                  />
                  <p className="truncate text-sm font-medium text-text">
                    {release.title}
                  </p>
                  <p className="truncate text-xs text-text/45">
                    {release.subtitle}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/5 bg-surface px-6 py-8 sm:px-10 sm:py-9 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <Heading
            variant="section"
            className="mb-2 font-display text-2xl font-medium"
          >
            Get the full Kindred experience
          </Heading>
          <Text className="max-w-md text-sm leading-relaxed text-text/60">
            Offline downloads, exclusive posts and tracks, and support for every
            artist you love — all in the app.
          </Text>
        </div>
        <GetTheAppButton
          iconSize={14}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        />
      </section>
    </main>
  );
};

export default PublicBrowsePage;
