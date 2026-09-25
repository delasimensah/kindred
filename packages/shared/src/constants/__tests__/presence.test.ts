import {
  PRESENCE_CLEANUP_AFTER_MS,
  PRESENCE_FRESH_MS,
  PRESENCE_HEARTBEAT_MS,
} from "../presence";

describe("presence intervals", () => {
  it("uses the locked 20s / 60s / 10min numbers", () => {
    expect(PRESENCE_HEARTBEAT_MS).toBe(20_000);
    expect(PRESENCE_FRESH_MS).toBe(60_000);
    expect(PRESENCE_CLEANUP_AFTER_MS).toBe(600_000);
  });
});
