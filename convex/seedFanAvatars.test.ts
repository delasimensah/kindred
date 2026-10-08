import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { seedAccounts } from "./lib/seedCatalog";
import { fanPhotos } from "./seedFanAvatars";
import { asUser, makeBackend } from "./test.setup";

describe("seedFanAvatars", () => {
  it("gives each seed fan a different photo", () => {
    const fans = new Set(
      seedAccounts()
        .filter(
          (account) => account.role !== "artist" && account.role !== "admin"
        )
        .map((account) => account.email)
    );
    const photos = fanPhotos();

    expect(photos).toHaveLength(fans.size - 1);
    expect(photos.every((photo) => fans.has(photo.email))).toBe(true);
    expect(new Set(photos.map((photo) => photo.photoId)).size).toBe(
      photos.length
    );
  });

  it("attaches a photo once and keeps a photo the fan already has", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindred.example",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const store = () =>
      t.run(async (ctx) =>
        ctx.storage.store(new Blob(["portrait"], { type: "image/jpeg" }))
      );
    const args = {
      email: "efua.boateng@kindred.example",
      contentType: "image/jpeg",
      sizeBytes: 8,
      credit: "Photo: Prince Akachi / Unsplash",
      sourceUrl: "https://unsplash.com/photos/x",
    };

    const first = await t.mutation(internal.seedFanAvatars.attachFanAvatar, {
      ...args,
      storageId: await store(),
    });
    const second = await t.mutation(internal.seedFanAvatars.attachFanAvatar, {
      ...args,
      storageId: await store(),
    });

    expect([first, second]).toEqual([true, false]);
    const files = await t.run(async (ctx) => ctx.db.query("files").collect());
    expect(files).toHaveLength(1);
  });
});
