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
      handle: "amaara",
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
  kind: "updatePhoto" | "voiceNote" | "artwork",
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

const voicePeaks = Array.from({ length: 48 }, (_, index) =>
  index === 0 ? 1 : 0.2
);

describe("posts", () => {
  it("lists public update text and hides a supporters-only body", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-posts",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("updatePosts", {
        artistId,
        body: "Asase is finished.",
        audience: "everyone",
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("updatePosts", {
        artistId,
        body: "The rough mix stays with supporters.",
        audience: "supporters",
        hidden: false,
        createdAt: Date.now() - 1000,
      });
      return artistId;
    });

    const listed = await asUser(t, userId).query(api.posts.listForArtist, {
      artistId,
    });
    expect(listed).toHaveLength(2);
    expect(listed[0]?.body).toBe("Asase is finished.");
    expect(listed[0]?.locked).toBe(false);
    const locked = listed.find((post) => post.locked);
    expect(locked?.body).toBeNull();
    expect(JSON.stringify(listed)).not.toMatch(/rough mix/i);
  });

  it("creates Everyone and Supporters-only updates for the artist", async () => {
    const t = makeBackend();
    const { userId } = await seedVerifiedArtist(t);
    const asArtist = asUser(t, userId);

    const everyoneId = await asArtist.mutation(api.posts.create, {
      body: "  Back in the studio this week.  ",
      audience: "everyone",
    });
    const supportersId = await asArtist.mutation(api.posts.create, {
      body: "Early rough mix for you first.",
      audience: "supporters",
    });

    const mine = await asArtist.query(api.posts.listMine, {});
    expect(mine.map((post) => post.postId)).toEqual([supportersId, everyoneId]);
    expect(mine[0]).toMatchObject({
      audience: "supporters",
      body: "Early rough mix for you first.",
    });
    expect(mine[1]).toMatchObject({
      audience: "everyone",
      body: "Back in the studio this week.",
    });
  });

  it("attaches a photo and voice note the artist owns", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const photoFileId = await seedOwnedFile(
      t,
      artistId,
      "updatePhoto",
      "image/jpeg"
    );
    const voiceFileId = await seedOwnedFile(
      t,
      artistId,
      "voiceNote",
      "audio/webm"
    );
    const asArtist = asUser(t, userId);

    const postId = await asArtist.mutation(api.posts.create, {
      body: "Clip from tonight's take.",
      audience: "supporters",
      photoFileId,
      voiceFileId,
      voiceDurationMs: 72000,
      voicePeaks,
    });

    const mine = await asArtist.query(api.posts.listMine, {});
    expect(mine[0]?.postId).toBe(postId);
    expect(mine[0]?.photoUrl).toEqual(expect.any(String));
    expect(mine[0]?.voiceUrl).toEqual(expect.any(String));
    expect(mine[0]?.voiceDurationMs).toBe(72000);
    expect(mine[0]?.voicePeaks).toHaveLength(48);
  });

  it("refuses empty body and foreign media", async () => {
    const t = makeBackend();
    const { userId } = await seedVerifiedArtist(t);
    const otherArtistId = await t.run(async (ctx) => {
      return await ctx.db.insert("artists", {
        name: "Other",
        handle: "other",
        bio: "Other",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const foreignPhoto = await seedOwnedFile(
      t,
      otherArtistId,
      "updatePhoto",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    try {
      await asArtist.mutation(api.posts.create, {
        body: "   ",
        audience: "everyone",
      });
      expect.unreachable();
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }

    try {
      await asArtist.mutation(api.posts.create, {
        body: "Stolen photo",
        audience: "everyone",
        photoFileId: foreignPhoto,
      });
      expect.unreachable();
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });

  it("edits and deletes the artist's own update", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const photoFileId = await seedOwnedFile(
      t,
      artistId,
      "updatePhoto",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const postId = await asArtist.mutation(api.posts.create, {
      body: "First draft",
      audience: "everyone",
      photoFileId,
    });

    await asArtist.mutation(api.posts.update, {
      postId,
      body: "Final take",
      audience: "supporters",
      removePhoto: true,
    });

    const edited = await asArtist.query(api.posts.getMine, { postId });
    expect(edited).toMatchObject({
      body: "Final take",
      audience: "supporters",
      hasPhoto: false,
      photoUrl: null,
    });

    await asArtist.mutation(api.posts.remove, { postId });
    expect(await asArtist.query(api.posts.listMine, {})).toHaveLength(0);
    expect(await asArtist.query(api.posts.getMine, { postId })).toBeNull();
  });

  it("refuses editing another artist's update", async () => {
    const t = makeBackend();
    const { userId } = await seedVerifiedArtist(t);
    const foreignPostId = await t.run(async (ctx) => {
      const other = await ctx.db.insert("artists", {
        name: "Other",
        handle: "other-edit",
        bio: "Other",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      return await ctx.db.insert("updatePosts", {
        artistId: other,
        body: "Not yours",
        audience: "everyone",
        hidden: false,
        createdAt: Date.now(),
      });
    });

    try {
      await asUser(t, userId).mutation(api.posts.update, {
        postId: foreignPostId,
        body: "Hijacked",
        audience: "everyone",
      });
      expect.unreachable();
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }

    try {
      await asUser(t, userId).mutation(api.posts.remove, {
        postId: foreignPostId,
      });
      expect.unreachable();
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});
