import { usePublicPlayer } from "./publicPlayerStore";

const item = (id: string) => ({
  kind: "track" as const,
  id,
  title: id,
  artistName: "Amaara Mensah",
  artworkUrl: null,
  durationMs: 1000,
});

describe("public player queue", () => {
  beforeEach(() => {
    usePublicPlayer.setState({
      queue: [],
      index: 0,
      playing: false,
      positionMs: 0,
      generation: 0,
    });
  });

  it("steps next and previous, and stops after the last track", () => {
    usePublicPlayer.getState().play([item("asase"), item("harmattan")], 0);
    usePublicPlayer.getState().next();
    expect(usePublicPlayer.getState().index).toBe(1);
    expect(usePublicPlayer.getState().playing).toBe(true);
    usePublicPlayer.getState().next();
    expect(usePublicPlayer.getState().index).toBe(1);
    expect(usePublicPlayer.getState().playing).toBe(false);
    usePublicPlayer.getState().previous();
    expect(usePublicPlayer.getState().index).toBe(0);
  });
});
