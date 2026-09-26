import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function seedVerifiedArtist(t: ReturnType<typeof makeBackend>) {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "amaara.mensah@kindred.example",
      name: "Amaara Mensah",
    });
  });
  const profileId = await asUser(t, userId).mutation(
    api.profiles.ensureProfile,
    {}
  );
  const artistId = await t.run(async (ctx) => {
    return await ctx.db.insert("artists", {
      profileId,
      name: "Amaara Mensah",
      handle: "amaara-releases",
      bio: "Highlife from Accra",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
  });
  return { userId, artistId };
}

async function seedOwnedFile(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  kind: "trackAudio" | "artwork",
  contentType: string
) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["bytes"]));
    return await ctx.db.insert("files", {
      storageId,
      kind,
      artistId,
      contentType,
      sizeBytes: 12,
      createdAt: Date.now(),
    });
  });
}

const peaks = Array.from({ length: 1000 }, (_, index) =>
  index === 0 ? 1 : 0.1
);

function memberTracks(
  count: number,
  audioFileId: Id<"files">
): Array<{
  title: string;
  audioFileId: Id<"files">;
  durationMs: number;
  peaks: number[];
}> {
  return Array.from({ length: count }, (_, index) => ({
    title: `Track ${index + 1}`,
    audioFileId,
    durationMs: 120000 + index,
    peaks,
  }));
}

describe("studioReleases", () => {
  it("creates an EP draft and publishes all member tracks together", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const releaseId = await asArtist.mutation(api.studioReleases.createDraft, {
      title: "Kokrobite EP",
      type: "ep",
      artworkFileId,
      visibility: "public",
      tags: ["highlife"],
      genre: "Highlife",
      tracks: memberTracks(4, audioFileId),
    });

    await asArtist.mutation(api.studioReleases.publishNow, { releaseId });
    const mine = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(mine?.state).toBe("published");
    expect(mine?.tracks).toHaveLength(4);

    const listed = await asArtist.query(api.studioTracks.listMine, {});
    expect(listed.every((row) => !("releaseId" in row))).toBe(true);
    expect(listed.filter((row) => row.title.startsWith("Track ")).length).toBe(
      0
    );

    const albums = await asArtist.query(api.studioReleases.listMine, {});
    expect(albums).toHaveLength(1);
    expect(albums[0]?.type).toBe("ep");
    expect(albums[0]?.trackCount).toBe(4);
  });

  it("refuses an EP with one track", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    try {
      await asArtist.mutation(api.studioReleases.createDraft, {
        title: "Too thin",
        type: "ep",
        artworkFileId,
        visibility: "public",
        tags: [],
        genre: "Highlife",
        tracks: memberTracks(1, audioFileId),
      });
      throw new Error("expected createDraft to fail");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });

  it("reorders, adds, and removes tracks on a draft EP", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const extraAudio = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const releaseId = await asArtist.mutation(api.studioReleases.createDraft, {
      title: "Draft EP",
      type: "ep",
      artworkFileId,
      visibility: "public",
      tags: [],
      genre: "Highlife",
      tracks: memberTracks(3, audioFileId),
    });

    const before = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(before?.tracks).toHaveLength(3);
    const ids = before!.tracks.map((track) => track.trackId);
    await asArtist.mutation(api.studioReleases.reorderTracks, {
      releaseId,
      orderedTrackIds: [ids[2]!, ids[0]!, ids[1]!],
    });
    const reordered = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(reordered?.tracks.map((track) => track.trackId)).toEqual([
      ids[2],
      ids[0],
      ids[1],
    ]);

    const addedId = await asArtist.mutation(api.studioReleases.addTrack, {
      releaseId,
      title: "Bonus",
      audioFileId: extraAudio,
      durationMs: 90_000,
      peaks,
    });
    const withAdd = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(withAdd?.tracks).toHaveLength(4);
    expect(withAdd?.tracks[3]?.trackId).toBe(addedId);

    await asArtist.mutation(api.studioReleases.removeTrack, {
      releaseId,
      trackId: addedId,
    });
    const afterRemove = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(afterRemove?.tracks).toHaveLength(3);

    await asArtist.mutation(api.studioReleases.update, {
      releaseId,
      title: "Draft EP",
      tags: [],
      genre: "Highlife",
      visibility: "public",
      tracks: afterRemove!.tracks.map((track, index) => ({
        trackId: track.trackId,
        title: `Renamed ${index + 1}`,
      })),
    });
    const renamed = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(renamed?.tracks.map((track) => track.title)).toEqual([
      "Renamed 1",
      "Renamed 2",
      "Renamed 3",
    ]);
  });

  it("allows reorder, add, and remove after publish", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const extraAudio = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const releaseId = await asArtist.mutation(api.studioReleases.createDraft, {
      title: "Live EP",
      type: "ep",
      artworkFileId,
      visibility: "public",
      tags: [],
      genre: "Highlife",
      tracks: memberTracks(2, audioFileId),
    });
    await asArtist.mutation(api.studioReleases.publishNow, { releaseId });
    const mine = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    const ids = mine!.tracks.map((track) => track.trackId);
    await asArtist.mutation(api.studioReleases.reorderTracks, {
      releaseId,
      orderedTrackIds: [ids[1]!, ids[0]!],
    });
    const addedId = await asArtist.mutation(api.studioReleases.addTrack, {
      releaseId,
      title: "Live bonus",
      audioFileId: extraAudio,
      durationMs: 88_000,
      peaks,
    });
    const withAdd = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(withAdd?.tracks).toHaveLength(3);
    expect(withAdd?.tracks[2]?.trackId).toBe(addedId);
    expect(withAdd?.tracks[2]?.title).toBe("Live bonus");

    await asArtist.mutation(api.studioReleases.removeTrack, {
      releaseId,
      trackId: addedId,
    });
    const afterRemove = await asArtist.query(api.studioReleases.getMine, {
      releaseId,
    });
    expect(afterRemove?.tracks).toHaveLength(2);
  });
});
