import { describe, expect, it } from "vitest";

import { displayNameForNewProfile } from "./profileName";

describe("displayNameForNewProfile", () => {
  it("uses the signed-up name when present", () => {
    expect(
      displayNameForNewProfile({
        name: "Efua Boateng",
        email: "efua.boateng@kindredmail.com",
      })
    ).toBe("Efua Boateng");
  });

  it("falls back to the email local part", () => {
    expect(
      displayNameForNewProfile({
        email: "efua.boateng@kindredmail.com",
      })
    ).toBe("efua.boateng");
  });
});
