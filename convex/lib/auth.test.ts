import { describe, expect, it } from "vitest";

import { api } from "../_generated/api";
import { asUser, errorCode, makeBackend } from "../test.setup";
import { canAccessStudio, requireProfile, requireStudioAccess } from "./auth";

describe("auth helpers", () => {
  it("requireProfile throws when signed out", async () => {
    const t = makeBackend();

    try {
      await t.run(async (ctx) => {
        await requireProfile(ctx);
      });
      throw new Error("expected requireProfile to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("UNAUTHENTICATED");
    }
  });

  it("canAccessStudio is true for admin or verified artist", () => {
    expect(canAccessStudio({ isAdmin: true, verifiedArtist: null })).toBe(true);
    expect(
      canAccessStudio({
        isAdmin: false,
        verifiedArtist: { verified: true } as never,
      })
    ).toBe(true);
    expect(canAccessStudio({ isAdmin: false, verifiedArtist: null })).toBe(
      false
    );
  });

  it("requireStudioAccess refuses fans", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "fan@kindred.example",
        name: "Fan",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});

    try {
      await asUser(t, userId).run(async (ctx) => {
        await requireStudioAccess(ctx);
      });
      throw new Error("expected requireStudioAccess to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});
