import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";

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
});
