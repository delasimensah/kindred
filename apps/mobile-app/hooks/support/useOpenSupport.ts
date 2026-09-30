import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { paywallHref, routeSupportHref, supportTarget } from "@/utils";

type SupportTarget = "paywall" | "route" | "open" | "pending";

export function useOpenSupport() {
  const router = useRouter();
  const summary = useQuery(api.routes.summary, {});
  const pending = useRef<{
    artistId?: string;
    leaveWhenOpen: boolean;
  } | null>(null);

  const go = (artistId: string | undefined, leaveWhenOpen: boolean) => {
    if (summary === undefined) {
      return "pending" as const;
    }
    const target = supportTarget({
      entitled: summary.entitled,
      routedArtistIds: summary.routedArtistIds,
      artistId,
    });
    if (target === "route") {
      router.push(routeSupportHref(artistId));
    } else if (target === "paywall") {
      router.push(paywallHref(artistId));
    } else if (leaveWhenOpen) {
      router.back();
    }
    return target;
  };

  useEffect(() => {
    if (summary === undefined || pending.current === null) {
      return;
    }
    const request = pending.current;
    pending.current = null;
    const target = supportTarget({
      entitled: summary.entitled,
      routedArtistIds: summary.routedArtistIds,
      artistId: request.artistId,
    });
    if (target === "route") {
      router.push(routeSupportHref(request.artistId));
    } else if (target === "paywall") {
      router.push(paywallHref(request.artistId));
    } else if (request.leaveWhenOpen) {
      router.back();
    }
  }, [router, summary]);

  return (artistId?: string, leaveWhenOpen = false): SupportTarget => {
    if (summary === undefined) {
      pending.current = { artistId, leaveWhenOpen };
      return "pending";
    }
    return go(artistId, leaveWhenOpen);
  };
}
