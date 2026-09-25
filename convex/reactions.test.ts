import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function publishedTrack(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">
) {
  return await t.run(async (ctx) => {
    const audioId = await ctx.db.insert("files", {
      storageId: await ctx.storage.store(new Blob(["audio"])),
      kind: "trackAudio",
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: Date.now(),
    });
    return await ctx.db.insert("tracks", {
      artistId,
      title: "Asase",
      audioFileId: audioId,
      visibility: "public",
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: [],
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: false,
      createdAt: Date.now(),
    });
  });
}

describe("reactions", () => {
  it("replaces the caller's emoji and keeps one count per replay", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      return await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-react",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const trackId = await publishedTrack(t, artistId);
    const authed = asUser(t, userId);

    await authed.mutation(api.reactions.set, {
      trackId,
      emoji: "🔥",
      clientEventId: "event-1",
    });
    await authed.mutation(api.reactions.set, {
      trackId,
      emoji: "❤️",
      clientEventId: "event-1",
    });
    const listed = await authed.query(api.reactions.listForTrack, { trackId });
    expect(listed.mine).toBe("🔥");
    expect(listed.counts.fire).toBe(1);
    expect(listed.counts.heart).toBe(0);

    await authed.mutation(api.reactions.set, {
      trackId,
      emoji: "❤️",
      clientEventId: "event-2",
    });
    const replaced = await authed.query(api.reactions.listForTrack, {
      trackId,
    });
    expect(replaced.mine).toBe("❤️");
    expect(replaced.counts.fire).toBe(0);
    expect(replaced.counts.heart).toBe(1);
  });

  it("refuses an emoji outside the set", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      return await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-react-bad",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const trackId = await publishedTrack(t, artistId);

    try {
      await asUser(t, userId).mutation(api.reactions.set, {
        trackId,
        emoji: "👍",
      });
      throw new Error("expected an unknown reaction to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });
});
