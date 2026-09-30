import {
  canSaveRoute,
  initialRouteSelection,
  routeChangeLine,
  routeStatusLine,
  splitCallout,
  supportTarget,
  toggleRouteArtist,
} from "./routeSelection";

describe("supportTarget", () => {
  it("skips the paywall once someone is already paying", () => {
    expect(
      supportTarget({ entitled: false, routedArtistIds: [], artistId: "a" })
    ).toBe("paywall");
    expect(
      supportTarget({ entitled: true, routedArtistIds: ["a"], artistId: "a" })
    ).toBe("open");
    expect(
      supportTarget({ entitled: true, routedArtistIds: ["a"], artistId: "b" })
    ).toBe("route");
    expect(supportTarget({ entitled: true, routedArtistIds: ["a"] })).toBe(
      "route"
    );
  });
});

describe("initialRouteSelection", () => {
  it("adds the artist who started support and keeps the current route", () => {
    const first = initialRouteSelection({
      followedIds: ["a", "b", "c"],
      routedIds: [],
      startingArtistId: "a",
    });
    expect(first.selectedIds).toEqual(["a", "b", "c"]);
    expect(first.lockedArtistId).toBe("a");

    const later = initialRouteSelection({
      followedIds: ["a", "b", "c", "d", "e", "f"],
      routedIds: ["a", "b", "c", "d", "e"],
      startingArtistId: "f",
    });
    expect(later.selectedIds).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(later.lockedArtistId).toBe("f");
    expect(
      toggleRouteArtist(later.selectedIds, "f", later.lockedArtistId)
    ).toEqual(later.selectedIds);
    expect(
      toggleRouteArtist(later.selectedIds, "a", later.lockedArtistId)
    ).toEqual(["b", "c", "d", "e", "f"]);
  });

  it("opens Account on the saved set with nobody forced", () => {
    const saved = initialRouteSelection({
      followedIds: ["a", "b"],
      routedIds: ["a"],
    });
    expect(saved).toEqual({ selectedIds: ["a"], lockedArtistId: null });
    expect(canSaveRoute(["a"], null)).toBe(true);
    expect(canSaveRoute([], null)).toBe(false);
    expect(splitCallout(3)).toBe("Each gets 33%");
    expect(splitCallout(1)).toBe("Your whole subscription goes to this artist");
    expect(splitCallout(0)).toBe(
      "Select at least 1 artist to route your support"
    );
    expect(routeStatusLine([])).toBeNull();
    expect(routeStatusLine(["Amaara Mensah", "Kweku Darko"])).toBe(
      "Already routing to 2 artists: Amaara Mensah, Kweku Darko."
    );
    const names: Record<string, string> = {
      a: "Amaara",
      b: "Kweku",
      f: "Sela",
    };
    const nameFor = (id: string) => names[id] ?? "";
    expect(
      routeChangeLine({
        selectedIds: ["a", "b", "c", "d", "e"],
        routedIds: ["a", "b", "c", "d", "e"],
        nameFor,
      })
    ).toBe("5 of 5. Turn someone off to route to a different artist.");
    expect(
      routeChangeLine({
        selectedIds: ["a", "b", "c", "d", "e", "f"],
        routedIds: ["a", "b", "c", "d", "e"],
        nameFor,
      })
    ).toBe("5 is the limit. Turn off one artist so Sela can take their place.");
    expect(
      routeChangeLine({
        selectedIds: ["b", "c", "d", "e", "f"],
        routedIds: ["a", "b", "c", "d", "e"],
        nameFor,
      })
    ).toBe("Replacing Amaara with Sela.");
  });
});
