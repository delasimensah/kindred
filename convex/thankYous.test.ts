import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

describe("thankYous", () => {
  it("ranks routed fans and lets only that artist send a thank-you", async () => {
    const t = makeBackend();
    const artistUser = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "amaara@kindred.example",
        name: "Amaara Mensah",
      });
    });
    const artistProfile = await asUser(t, artistUser).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const otherUser = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "kweku@kindred.example",
        name: "Kweku Darko",
      });
    });
    const otherProfile = await asUser(t, otherUser).mutation(
      api.profiles.ensureProfile,
      {}
    );

    const { fanProfile, artistId } = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        profileId: artistProfile,
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("artists", {
        profileId: otherProfile,
        name: "Kweku Darko",
        handle: "kweku-darko",
        bio: "Kumasi",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const fanUser = await ctx.db.insert("users", {
        email: "efua@kindred.example",
        name: "Efua Boateng",
      });
      const fanProfile = await ctx.db.insert("profiles", {
        authUserId: fanUser,
        displayName: "Efua Boateng",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: fanProfile,
        artistId,
        active: true,
        startedAt: Date.UTC(2026, 7, 12),
        founding: true,
        thanked: false,
      });
      const nextUser = await ctx.db.insert("users", {
        email: "kwesi@kindred.example",
        name: "Kwesi Boateng",
      });
      const nextProfile = await ctx.db.insert("profiles", {
        authUserId: nextUser,
        displayName: "Kwesi Boateng",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: nextProfile,
        artistId,
        active: true,
        startedAt: Date.UTC(2026, 8, 1),
        founding: false,
        thanked: false,
      });
      return { fanProfile, artistId };
    });
    void artistId;

    const ranked = await asUser(t, artistUser).query(
      api.thankYous.rankCandidates,
      {}
    );
    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.draft).toContain("Efua");
    expect(ranked[1]?.displayName).toBe("Kwesi Boateng");

    const thankYouId = await asUser(t, artistUser).mutation(
      api.thankYous.send,
      {
        profileId: fanProfile,
        body: "Efua, thank you for believing early.",
      }
    );
    expect(thankYouId).toBeTruthy();

    const afterSend = await asUser(t, artistUser).query(
      api.thankYous.rankCandidates,
      {}
    );
    expect(afterSend.map((row) => row.displayName)).toEqual(["Kwesi Boateng"]);

    await expect(
      asUser(t, artistUser).mutation(api.thankYous.send, {
        profileId: fanProfile,
        body: "Efua, thank you again.",
      })
    ).rejects.toSatisfy((error: unknown) => errorCode(error) === "INVALID");

    await expect(
      asUser(t, otherUser).mutation(api.thankYous.send, {
        profileId: fanProfile,
        body: "Nope",
      })
    ).rejects.toSatisfy(
      (error: unknown) => errorCode(error) === "NOT_PERMITTED"
    );
  });
});
