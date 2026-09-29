import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";

import { SearchTabScreen } from "@/components";
import {
  recentArtist,
  type RecentSearchItem,
  recentTrack,
  useDebouncedSearchTerm,
  usePreviewPlayer,
  useRecentSearches,
} from "@/hooks";
import { bindQueueActions, changeFollow, searchArtistHref } from "@/utils";

const SearchRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const [draft, setDraft] = useState("");
  const term = useDebouncedSearchTerm(draft);
  const recent = useRecentSearches();
  const results = useQuery(api.search.exact, term === null ? "skip" : { term });
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);
  const setLiked = useMutation(api.library.setLiked);

  const artists = term === null ? [] : (results?.artists ?? []);
  const tracks = term === null ? [] : (results?.tracks ?? []);
  const queue = tracks.map((track) => ({
    trackId: track.trackId,
    title: track.title,
    artistName: track.artistName,
    artistId: track.artistId,
    artworkUrl: track.artworkUrl,
    durationMs: track.durationMs,
    locked: track.locked,
    source: "search" as const,
  }));
  const actions = bindQueueActions(player, queue);

  return (
    <SearchTabScreen
      draft={draft}
      onChangeDraft={setDraft}
      artists={artists}
      tracks={tracks}
      isLoading={term !== null && results === undefined}
      hasQuery={term !== null}
      recent={recent.items}
      onOpenRecentArtist={(artistId) => {
        const saved = recent.items?.find(
          (item) => item.kind === "artist" && item.artistId === artistId
        );
        if (saved !== undefined) {
          void recent.remember(saved);
        }
        router.push(searchArtistHref(artistId));
      }}
      onPlayRecentTrack={(trackId) => {
        const saved = recent.items?.find(
          (item) => item.kind === "track" && item.trackId === trackId
        );
        if (saved === undefined || saved.kind !== "track") {
          return;
        }
        void recent.remember(saved);
        player.play({ ...recentTrack(saved), locked: false, source: "search" });
      }}
      onForgetRecent={(item: RecentSearchItem) => {
        void recent.forget(item);
      }}
      onClearRecent={() => {
        void recent.clear();
      }}
      playingTrackId={player.track.trackId}
      isPlaying={player.isPlaying}
      onToggleFollow={(artistId) => {
        const artist = artists.find((row) => row.artistId === artistId);
        if (artist === undefined) {
          return;
        }
        const id = artist.artistId as Id<"artists">;
        void changeFollow(() =>
          artist.isFollowed
            ? removeFollow({ artistId: id })
            : addFollow({ artistId: id })
        );
      }}
      onOpenArtist={(artistId) => {
        const artist = artists.find((row) => row.artistId === artistId);
        if (artist !== undefined) {
          void recent.remember(recentArtist(artist));
        }
        router.push(searchArtistHref(artistId));
      }}
      onPlay={(trackId) => {
        const track = tracks.find((row) => row.trackId === trackId);
        if (track !== undefined && !track.locked) {
          void recent.remember(recentTrack(track));
        }
        actions.play(trackId);
      }}
      onPlayNext={actions.playNext}
      onAddToQueue={actions.addToQueue}
      onToggleLike={(trackId) => {
        const track = tracks.find((row) => row.trackId === trackId);
        if (track === undefined) {
          return;
        }
        void setLiked({
          trackId: track.trackId as Id<"tracks">,
          liked: !track.liked,
        });
      }}
    />
  );
};

export default SearchRoute;
