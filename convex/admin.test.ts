import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, errorCode, makeBackend } from "./test.setup";

const request = {
  displayName: "Efua Boateng",
  bio: "Afro-soul from Accra.",
  note: "I want a home for these songs.",
};

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

describe("admin artist requests", () => {
  it("refuses the queue and approve when the caller is not an admin", async () => {
    const t = makeBackend();
    const fanId = await insertUser(t, "efua.boateng@kindredmail.com", "Efua");
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    await asUser(t, fanId).mutation(api.artistRequests.submit, request);

    try {
      await asUser(t, fanId).query(api.admin.queue, {});
      throw new Error("expected the queue to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }

    const requestId = await t.run(async (ctx) => {
      const row = await ctx.db.query("artistRequests").first();
      if (row === null) {
        throw new Error("request missing");
      }
      return row._id;
    });
    try {
      await asUser(t, fanId).mutation(api.admin.approve, { requestId });
      throw new Error("expected approve to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });

  it("approves a request into a verified artist who can open Studio", async () => {
    const t = makeBackend();
    const fanId = await insertUser(
      t,
      "efua.boateng@kindredmail.com",
      "Efua Boateng"
    );
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    await asUser(t, fanId).mutation(api.artistRequests.submit, request);

    const adminId = await insertUser(
      t,
      "delasi.mensah@kindred.example",
      "Delasi"
    );
    await makeAdmin(t, adminId);

    const queue = await asUser(t, adminId).query(api.admin.queue, {});
    expect(queue.pending).toHaveLength(1);
    expect(queue.pending[0]?.email).toBe("efua.boateng@kindredmail.com");
    expect(queue.pending[0]?.bio).toBe(request.bio);

    await asUser(t, adminId).mutation(api.admin.approve, {
      requestId: queue.pending[0].requestId,
    });

    const me = await asUser(t, fanId).query(api.profiles.getMe, {});
    expect(me?.canAccessStudio).toBe(true);
    const artist = await t.run(async (ctx) => {
      return await ctx.db.query("artists").first();
    });
    expect(artist).toMatchObject({
      name: "Efua Boateng",
      handle: "efua-boateng",
      verified: true,
      bio: request.bio,
    });
    const stats = await t.run(async (ctx) => {
      return await ctx.db.query("artistStats").collect();
    });
    expect(stats).toHaveLength(1);

    const after = await asUser(t, adminId).query(api.admin.queue, {});
    expect(after.pending).toHaveLength(0);
    expect(after.approvedThisMonth).toBe(1);
  });

  it("declines a request so the fan can send another", async () => {
    const t = makeBackend();
    const fanId = await insertUser(t, "fan@kindredmail.com", "Fan");
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    await asUser(t, fanId).mutation(api.artistRequests.submit, request);
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);

    const queue = await asUser(t, adminId).query(api.admin.queue, {});
    await asUser(t, adminId).mutation(api.admin.decline, {
      requestId: queue.pending[0].requestId,
      reason: "Need a public link",
    });

    const mine = await asUser(t, fanId).query(api.artistRequests.getMine, {});
    expect(mine).toMatchObject({
      status: "declined",
      declineReason: "Need a public link",
    });
    await asUser(t, fanId).mutation(api.artistRequests.submit, {
      ...request,
      note: "The songs are on my site.",
    });
    const again = await asUser(t, adminId).query(api.admin.queue, {});
    expect(again.pending).toHaveLength(1);
    expect(again.declinedThisMonth).toBe(1);
  });

  it("verifies and unverifies an artist", async () => {
    const t = makeBackend();
    const artistUserId = await insertUser(
      t,
      "amaara.mensah@kindred.example",
      "Amaara"
    );
    await asUser(t, artistUserId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      const profile = await ctx.db.query("profiles").first();
      if (profile === null) {
        throw new Error("profile missing");
      }
      return await ctx.db.insert("artists", {
        profileId: profile._id,
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Highlife.",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);

    await asUser(t, adminId).mutation(api.admin.setVerified, {
      artistId,
      verified: false,
    });
    const locked = await asUser(t, artistUserId).query(api.profiles.getMe, {});
    expect(locked?.canAccessStudio).toBe(false);

    await asUser(t, adminId).mutation(api.admin.setVerified, {
      artistId,
      verified: true,
    });
    const opened = await asUser(t, artistUserId).query(api.profiles.getMe, {});
    expect(opened?.canAccessStudio).toBe(true);

    try {
      await asUser(t, artistUserId).mutation(api.admin.setVerified, {
        artistId,
        verified: false,
      });
      throw new Error("expected a non-admin to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});

async function insertArtist(
  t: ReturnType<typeof makeBackend>,
  handle: string,
  name: string
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("artists", {
      name,
      handle,
      bio: "Highlife from Accra.",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
  });
}

async function insertPublishedTrack(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  title: string
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
    return await ctx.db.insert("tracks", {
      artistId,
      title,
      audioFileId,
      visibility: "public",
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: [0],
      tags: [],
      genre: "Highlife",
      hidden: false,
      createdAt: Date.now(),
    });
  });
}

describe("admin catalog and featured slots", () => {
  it("refuses catalog and featured changes when the caller is not an admin", async () => {
    const t = makeBackend();
    const fanId = await insertUser(t, "fan@kindredmail.com", "Fan");
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    const artistId = await insertArtist(t, "amaara", "Amaara Mensah");
    const trackId = await insertPublishedTrack(
      t,
      artistId,
      "Kokrobite Sessions"
    );

    try {
      await asUser(t, fanId).mutation(api.admin.setHidden, {
        target: { kind: "track", id: trackId },
        hidden: true,
      });
      throw new Error("expected hide to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
    try {
      await asUser(t, fanId).mutation(api.admin.setFeaturedSlots, {
        artistIds: [artistId],
      });
      throw new Error("expected featured to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });

  it("hides a track and a post so fans no longer see them, then removes the track", async () => {
    const t = makeBackend();
    const fanId = await insertUser(t, "fan@kindredmail.com", "Fan");
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    const artistId = await insertArtist(t, "amaara", "Amaara Mensah");
    const trackId = await insertPublishedTrack(
      t,
      artistId,
      "Kokrobite Sessions"
    );
    const postId = await t.run(async (ctx) => {
      return await ctx.db.insert("updatePosts", {
        artistId,
        body: "Studio note",
        audience: "everyone",
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);

    await asUser(t, adminId).mutation(api.admin.setHidden, {
      target: { kind: "track", id: trackId },
      hidden: true,
    });
    const listed = await asUser(t, fanId).query(
      api.tracks.listPublishedForArtist,
      { artistId }
    );
    expect(listed.tracks).toHaveLength(0);
    const detail = await asUser(t, fanId).query(api.tracks.get, { trackId });
    expect(detail).toBeNull();

    await asUser(t, adminId).mutation(api.admin.setHidden, {
      target: { kind: "post", id: postId },
      hidden: true,
    });
    const posts = await asUser(t, fanId).query(api.posts.listForArtist, {
      artistId,
    });
    expect(posts).toHaveLength(0);

    await asUser(t, adminId).mutation(api.admin.removeTrack, { trackId });
    const gone = await t.run(async (ctx) => ctx.db.get(trackId));
    expect(gone).toBeNull();
  });

  it("places featured artists in order and drops a hidden artist from Discover", async () => {
    const t = makeBackend();
    const fanId = await insertUser(t, "fan@kindredmail.com", "Fan");
    await asUser(t, fanId).mutation(api.profiles.ensureProfile, {});
    await asUser(t, fanId).mutation(api.profiles.setGenres, {
      genres: ["Highlife"],
    });
    const amaara = await insertArtist(t, "amaara", "Amaara Mensah");
    const yaw = await insertArtist(t, "yaw-darko", "Yaw Darko");
    const adminId = await insertUser(t, "admin@kindred.example", "Admin");
    await makeAdmin(t, adminId);

    await asUser(t, adminId).mutation(api.admin.setFeaturedSlots, {
      artistIds: [yaw, amaara],
    });
    const discover = await asUser(t, fanId).query(
      api.discovery.listForDiscover,
      {}
    );
    expect(discover.featured.map((row) => row.handle)).toEqual([
      "yaw-darko",
      "amaara",
    ]);

    await asUser(t, adminId).mutation(api.admin.setHidden, {
      target: { kind: "artist", id: yaw },
      hidden: true,
    });
    const after = await asUser(t, fanId).query(
      api.discovery.listForDiscover,
      {}
    );
    expect(after.featured.map((row) => row.handle)).toEqual(["amaara"]);

    try {
      await asUser(t, adminId).mutation(api.admin.setFeaturedSlots, {
        artistIds: [yaw],
      });
      throw new Error("expected a hidden artist to be refused");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });
});
