import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";

describe("discovery", () => {
  it("returns seeded featured artists first and rising without duplicates", async () => {
    const t = makeBackend();
    await t.mutation(internal.seedCatalog.upsertArtists, {});
    await t.mutation(internal.seedCatalog.upsertDiscovery, {});
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await asUser(t, userId).mutation(api.profiles.setGenres, {
      genres: ["Amapiano"],
    });

    const page = await asUser(t, userId).query(
      api.discovery.listForDiscover,
      {}
    );

    expect(page.featured.map((row) => row.handle)).toEqual([
      "sela-okoro",
      "amaara",
    ]);
    expect(page.rising.length).toBeGreaterThan(0);
    const featuredIds = new Set(page.featured.map((row) => row.artistId));
    for (const row of page.rising) {
      expect(featuredIds.has(row.artistId)).toBe(false);
    }

    await asUser(t, userId).mutation(api.follows.add, {
      artistId: page.featured[0].artistId,
    });
    const again = await asUser(t, userId).query(
      api.discovery.listForDiscover,
      {}
    );
    expect(again.featured[0].isFollowed).toBe(true);
  });
});
