"use client";

import { api } from "@convex/_generated/api";
import { Button } from "@mantine/core";
import {
  IconCalendar,
  IconCloudUpload,
  IconHandClick,
  IconHeart,
} from "@tabler/icons-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useStudioSession } from "@/hooks";

import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import StudioHomePageSkeleton from "./StudioHomePageSkeleton";

function greetingForNow(name: string): string {
  const hour = new Date().getHours();
  const first = name.trim().split(/\s+/)[0] || "there";
  if (hour < 12) {
    return `Good morning, ${first}`;
  }
  if (hour < 18) {
    return `Good afternoon, ${first}`;
  }
  return `Good evening, ${first}`;
}

function formatReleaseDate(ms: number | null): string {
  if (ms === null) {
    return "";
  }
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

const StudioHomePage: React.FC = () => {
  const home = useQuery(api.studio.getHome, {});
  const session = useStudioSession();
  const router = useRouter();
  const opensAdminHome = session.isAdmin && session.artistId === null;

  useEffect(() => {
    if (opensAdminHome) {
      router.replace("/admin/requests");
    }
  }, [opensAdminHome, router]);

  if (opensAdminHome) {
    return <LoadingScreen />;
  }

  if (home === undefined) {
    return <StudioHomePageSkeleton />;
  }

  if (home === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Heading variant="section" className="mb-3 text-xl text-text">
          No artist profile linked
        </Heading>
        <Text className="max-w-md text-sm text-text/60">
          Studio home shows releases and supporters for a verified artist. Sign
          in with a seeded artist account, or finish artist approval first.
        </Text>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            {greetingForNow(home.artistName)}
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            Here&apos;s how your catalogue is doing today.
          </Text>
        </div>
        <Button
          component={Link}
          href="/upload"
          leftSection={<IconCloudUpload size={14} />}
          className="h-auto rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        >
          Upload release
        </Button>
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/supporters" className="block no-underline">
          <MetricCard
            label="Supporters"
            value={String(home.supporterCount)}
            hint="Live count from your artist stats"
            Icon={IconHeart}
          />
        </Link>
        <MetricCard
          label="Scheduled"
          value={String(home.scheduledCount)}
          hint={
            home.nextScheduledAt
              ? `Next: ${formatReleaseDate(home.nextScheduledAt)}`
              : "Nothing scheduled"
          }
          Icon={IconCalendar}
        />
        <Link href="/thank-yous" className="block no-underline">
          <MetricCard
            label="Thank-yous sent"
            value={String(home.thankYouCount)}
            hint="Recent sends to fans routing to you"
            Icon={IconHandClick}
          />
        </Link>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <Heading variant="subsection" className="mb-0 text-lg text-text">
            Recent releases
          </Heading>
          <Link
            href="/releases"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {home.recentReleases.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-surface px-6 py-10 text-center">
            <Text className="text-sm text-text/50">
              No releases yet.{" "}
              <Link href="/upload" className="text-primary hover:underline">
                Upload your first track
              </Link>
              .
            </Text>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.recentReleases.map((release) => (
              <article
                key={release.trackId}
                className="overflow-hidden rounded-2xl border border-white/5 bg-surface"
              >
                <div className="relative h-40 bg-page">
                  {release.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={release.artworkUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span
                    className={
                      release.state === "scheduled"
                        ? "absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-textOnPrimary"
                        : "absolute left-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-textOnPrimary"
                    }
                  >
                    {release.state === "scheduled" ? "Scheduled" : "Published"}
                  </span>
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-semibold text-text">
                    {release.title}
                  </p>
                  <p className="mt-1 text-xs text-text/45">
                    {release.state === "scheduled"
                      ? `Releases ${formatReleaseDate(release.publishAt)}`
                      : `Released ${formatReleaseDate(release.publishedAt)}`}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <Heading variant="subsection" className="mb-0 text-lg text-text">
            Recent thank-yous
          </Heading>
          <Link
            href="/thank-yous"
            className="text-sm text-primary hover:underline"
          >
            Fans to thank
          </Link>
        </div>
        {home.recentThankYous.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-surface px-6 py-10 text-center">
            <Text className="text-sm text-text/50">
              No thank-yous yet.{" "}
              <Link href="/thank-yous" className="text-primary hover:underline">
                Thank a fan
              </Link>
              .
            </Text>
          </div>
        ) : (
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-surface">
            {home.recentThankYous.map((row) => (
              <li key={row.id} className="px-5 py-4">
                <p className="text-sm font-semibold text-text">{row.fanName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-text/60">
                  {row.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

function MetricCard({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string;
  hint: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-text/45">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon size={14} className="text-primary" />
        </div>
      </div>
      <p className="font-display text-[34px] leading-none text-text">{value}</p>
      <p className="mt-3 text-xs text-text/40">{hint}</p>
    </div>
  );
}

export default StudioHomePage;
