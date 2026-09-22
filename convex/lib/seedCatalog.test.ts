import { describe, expect, it } from "vitest";

import {
  buildTrackPlan,
  demoAccounts,
  SEED_ARTWORK_COUNT,
  SEED_AUDIO_COUNT,
  SEED_TRACK_COUNT,
  seedAccounts,
  seedArtists,
} from "./seedCatalog";

describe("seedCatalog plan", () => {
  it("builds the cast, the catalog, and the named logins", () => {
    const artists = seedArtists();
    const tracks = buildTrackPlan();
    const demos = demoAccounts();
    const titles = new Set(tracks.map((track) => track.title));
    expect(artists).toHaveLength(12);
    expect(artists.filter((artist) => artist.hero)).toHaveLength(3);
    expect(tracks).toHaveLength(SEED_TRACK_COUNT);
    expect(titles.size).toBe(SEED_TRACK_COUNT);
    expect(tracks.every((track) => track.audioIndex < SEED_AUDIO_COUNT)).toBe(
      true
    );
    expect(
      tracks.every((track) => track.artworkIndex < SEED_ARTWORK_COUNT)
    ).toBe(true);
    const asase = tracks.find((track) => track.title === "Asase");
    expect(asase).toMatchObject({
      artistHandle: "amaara",
      visibility: "public",
      state: "published",
    });
    expect(tracks.filter((track) => track.state === "scheduled").length).toBe(
      3
    );
    expect(tracks.some((track) => track.visibility === "supporters")).toBe(
      true
    );
    expect(demos.map((account) => account.displayName)).toEqual([
      "Akosua Frimpong",
      "Efua Boateng",
      "Amaara Mensah",
      "Delasi Mensah",
    ]);
    expect(
      seedAccounts().filter((account) => account.role === "audience")
    ).toHaveLength(40);
    expect(
      seedAccounts().some((account) =>
        /test user|artist \d+/i.test(account.displayName)
      )
    ).toBe(false);
  });
});
