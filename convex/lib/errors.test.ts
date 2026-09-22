import { describe, expect, it } from "vitest";

import { ERROR_CODES, raise } from "./errors";

describe("errors", () => {
  it("raises typed errors", () => {
    expect(() => raise(ERROR_CODES.UNAUTHENTICATED)).toThrow();
  });
});
