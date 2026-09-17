import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { ERROR_CODES, raise } from "./lib/errors";
import schema from "./schema";

describe("scaffold convex", () => {
  it("defines auth tables and profiles", async () => {
    const t = convexTest(schema);
    expect(t).toBeTruthy();
  });

  it("raises typed errors", () => {
    expect(() => raise(ERROR_CODES.UNAUTHENTICATED)).toThrow();
  });
});
