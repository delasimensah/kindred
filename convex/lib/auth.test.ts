import { describe, expect, it } from "vitest";

import { errorCode, makeBackend } from "../test.setup";
import { requireProfile } from "./auth";

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
});
