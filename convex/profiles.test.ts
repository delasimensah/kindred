import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

describe("profiles", () => {
  it("creates a profile on first sign-in and returns it from getMe", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });

    const profileId = await asUser(t, userId).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const again = await asUser(t, userId).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const me = await asUser(t, userId).query(api.profiles.getMe, {});

    expect(again).toBe(profileId);
    expect(me).toMatchObject({
      profileId,
      displayName: "Efua Boateng",
      isAdmin: false,
      genres: [],
    });
  });

  it("refuses getMe when nobody is signed in", async () => {
    const t = makeBackend();

    try {
      await t.query(api.profiles.getMe, {});
      throw new Error("expected getMe to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("UNAUTHENTICATED");
    }
  });
});
