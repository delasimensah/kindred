import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, makeBackend } from "./test.setup";

async function insertUser(
  t: ReturnType<typeof makeBackend>,
  email: string,
  name: string
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", { email, name });
  });
}

async function makeAdmin(
  t: ReturnType<typeof makeBackend>,
  userId: Id<"users">
) {
  await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
  await t.run(async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", userId))
      .unique();
    if (profile === null) {
      throw new Error("profile missing");
    }
    await ctx.db.patch(profile._id, { isAdmin: true });
  });
}

async function insertArtist(
  t: ReturnType<typeof makeBackend>,
  name: string,
  handle: string
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("artists", {
      name,
      handle,
      bio: "Highlife.",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
  });
}

async function insertTrack(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  title: string,
  extra: {
    state?: "draft" | "scheduled" | "published";
    hidden?: boolean;
    releaseId?: Id<"releases">;
    position?: number;
  } = {}
) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob(["audio"], { type: "audio/mpeg" })
    );
    const audioFileId = await ctx.db.insert("files", {
      storageId,
      kind: "trackAudio",
      artistId,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: Date.now(),
    });
    const state = extra.state ?? "published";
    return await ctx.db.insert("tracks", {
      artistId,
      title,
      audioFileId,
      visibility: "public",
      state,
      publishedAt: state === "published" ? Date.now() : undefined,
      publishAt: state === "scheduled" ? Date.now() + 86_400_000 : undefined,
      durationMs: 180000,
      peaks: [0],
      tags: [],
      genre: "Highlife",
      hidden: extra.hidden ?? false,
      releaseId: extra.releaseId,
      position: extra.position,
      createdAt: Date.now(),
    });
  });
}

describe("admin catalog pages", () => {
  it("pages artists by name and finds a track or artist from search", async () => {
    const t = makeBackend();
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);
    await insertArtist(t, "Amaara Mensah", "amaara");
    await insertArtist(t, "Sela Okoro", "sela");
    const yaw = await insertArtist(t, "Yaw Darko", "yaw");
    await insertTrack(t, yaw, "Kokrobite Sessions");

    const first = await asUser(t, adminId).query(api.adminCatalog.listArtists, {
      paginationOpts: { numItems: 2, cursor: null },
    });
    expect(first.page.map((row) => row.name)).toEqual([
      "Amaara Mensah",
      "Sela Okoro",
    ]);
    expect(first.isDone).toBe(false);

    const second = await asUser(t, adminId).query(
      api.adminCatalog.listArtists,
      { paginationOpts: { numItems: 2, cursor: first.continueCursor } }
    );
    expect(second.page.map((row) => row.name)).toEqual(["Yaw Darko"]);
    expect(second.isDone).toBe(true);

    const artists = await asUser(t, adminId).query(
      api.adminCatalog.searchArtists,
      { term: "Yaw" }
    );
    expect(artists.map((row) => row.handle)).toEqual(["yaw"]);

    const tracks = await asUser(t, adminId).query(
      api.adminCatalog.searchTracks,
      {
        term: "Kokrobite",
        paginationOpts: { numItems: 10, cursor: null },
      }
    );
    expect(tracks.page).toHaveLength(1);
    expect(tracks.page[0]).toMatchObject({
      title: "Kokrobite Sessions",
      artistName: "Yaw Darko",
    });
  });

  it("keeps drafts out of the hidden queue and splits releases from singles", async () => {
    const t = makeBackend();
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);
    const artistId = await insertArtist(t, "Amaara Mensah", "amaara");
    await insertTrack(t, artistId, "Hidden Live", { hidden: true });
    await insertTrack(t, artistId, "Hidden Draft", {
      state: "draft",
      hidden: true,
    });
    await insertTrack(t, artistId, "Coming Soon", { state: "scheduled" });
    const releaseId = await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(
        new Blob(["cover"], { type: "image/jpeg" })
      );
      const artworkFileId = await ctx.db.insert("files", {
        storageId,
        kind: "artwork",
        artistId,
        contentType: "image/jpeg",
        sizeBytes: 4,
        createdAt: Date.now(),
      });
      return await ctx.db.insert("releases", {
        artistId,
        title: "Lagoon",
        type: "ep",
        artworkFileId,
        visibility: "public",
        state: "published",
        publishedAt: Date.now(),
        genre: "Highlife",
        tags: [],
        hidden: false,
        createdAt: Date.now(),
      });
    });
    await insertTrack(t, artistId, "Lagoon One", { releaseId, position: 0 });
    await insertTrack(t, artistId, "Lagoon Two", { releaseId, position: 1 });
    await insertTrack(t, artistId, "Loose Single");

    const hidden = await asUser(t, adminId).query(
      api.adminCatalog.listHiddenTracks,
      { paginationOpts: { numItems: 10, cursor: null } }
    );
    expect(hidden.page.map((row) => row.title)).toEqual(["Hidden Live"]);

    const scheduled = await asUser(t, adminId).query(
      api.adminCatalog.listScheduledTracks,
      { paginationOpts: { numItems: 10, cursor: null } }
    );
    expect(scheduled.page.map((row) => row.title)).toEqual(["Coming Soon"]);

    const releases = await asUser(t, adminId).query(
      api.adminCatalog.listReleases,
      { artistId, paginationOpts: { numItems: 10, cursor: null } }
    );
    expect(releases.page).toHaveLength(1);
    expect(releases.page[0]?.title).toBe("Lagoon");
    expect(releases.page[0]?.tracks.map((row) => row.title)).toEqual([
      "Lagoon One",
      "Lagoon Two",
    ]);

    const singles = await asUser(t, adminId).query(
      api.adminCatalog.listSingles,
      { artistId, paginationOpts: { numItems: 20, cursor: null } }
    );
    expect(singles.page.map((row) => row.title)).toEqual([
      "Loose Single",
      "Hidden Live",
    ]);
  });
});
