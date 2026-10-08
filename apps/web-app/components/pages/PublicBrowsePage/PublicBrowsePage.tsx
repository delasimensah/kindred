"use client";

import { IconPlayerPlayFilled } from "@tabler/icons-react";
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
  playTracks: BrowsePlayTrack[];
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
  onPlayTrack: (trackId: string) => void;
}

function genreLabel(bio: string) {
  const genre = bio.split(" · ")[0]?.trim();
  return genre !== undefined && genre.length > 0 ? genre : bio;
}

const PublicBrowsePage: React.FC<PublicBrowsePageProps> = ({
  featured,
  rising,
  releases,
  onPlayTrack,
}) => {
  const featuredImage = featured?.avatarUrl ?? featured?.coverUrl ?? null;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:px-10 lg:py-9">
      <section className="mb-11">
        <Heading variant="section" className="mb-5 text-lg font-semibold">
          Featured
        </Heading>
        {featured === null ? (
          <Text className="text-sm text-text/50">No featured artist yet.</Text>
        ) : (
          <div className="grid overflow-hidden rounded-2xl bg-surface md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
            <Link
              href={`/artist/${featured.handle}`}
              aria-label={featured.name}
              className="relative block h-80 bg-page md:h-[420px]"
            >
              {featuredImage !== null ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredImage}
                  alt=""
                  className="h-full w-full object-cover object-top"
                />
              ) : null}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16 font-display text-2xl font-medium text-white">
                {featured.name}
              </span>
            </Link>
            <div className="flex flex-col justify-center px-5 py-6 sm:px-8">
              <Text className="text-sm leading-relaxed text-text/60">
                {featured.bio}
              </Text>
              {featured.playTracks.length > 0 ? (
                <ul className="mt-5 divide-y divide-white/5">
                  {featured.playTracks.map((track) => (
                    <li key={track.trackId}>
                      <button
                        type="button"
                        aria-label={`Play ${track.title}`}
                        onClick={() => onPlayTrack(track.trackId)}
                        className="flex w-full items-center gap-3 py-2.5 text-left"
                      >
                        <Artwork
                          url={track.artworkUrl}
                          className="h-10 w-10 rounded-lg"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                          {track.title}
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-textOnPrimary">
                          <IconPlayerPlayFilled size={12} className="ml-0.5" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <GetTheAppButton
                iconSize={14}
                className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
              />
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
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
            {rising.map((artist) => (
              <li key={artist.handle}>
                <Link
                  href={`/artist/${artist.handle}`}
                  className="flex h-full flex-col items-center rounded-2xl border border-white/5 bg-surface p-4 text-center transition-colors hover:border-white/15 sm:p-5"
                >
                  <Artwork
                    url={artist.avatarUrl}
                    className="mx-auto mb-4 h-20 w-20 rounded-full"
                  />
                  <p className="w-full truncate text-sm font-semibold text-text">
                    {artist.name}
                  </p>
                  <p className="w-full truncate text-xs text-text/45">
                    {genreLabel(artist.bio)}
                  </p>
                </Link>
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
