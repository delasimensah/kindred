import { describe, expect, it } from "vitest";

import {
  handleBaseFromDisplayName,
  handleWithSuffix,
} from "./artistRequestHandle";

describe("artist request handles", () => {
  it("slugs a display name and keeps a suffix inside the length cap", () => {
    expect(handleBaseFromDisplayName("Efua Boateng")).toBe("efua-boateng");
    expect(handleBaseFromDisplayName("   ")).toBe("artist");
    expect(handleWithSuffix("efua-boateng", 2)).toBe("efua-boateng-2");
  });
});
