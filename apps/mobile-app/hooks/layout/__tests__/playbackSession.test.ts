import { emptyQueue, normalizeTrack, replaceQueue } from "../playbackQueue";
import {
  parsePlaybackSession,
  serializePlaybackSession,
} from "../playbackSession";

describe("playbackSession", () => {
  it("round-trips the queue and the saved position", () => {
    const queue = replaceQueue(
      [
        normalizeTrack({
          trackId: "track_asase",
          title: "Asase",
          artistName: "Amaara Mensah",
          source: "artist",
        }),
      ],
      "track_asase",
      emptyQueue()
    );
    const raw = serializePlaybackSession(queue, 42.5);
    expect(raw).not.toBeNull();
    const restored = parsePlaybackSession(raw ?? "");
    expect(restored?.positionSec).toBe(42.5);
    expect(restored?.queue.tracks[0]?.trackId).toBe("track_asase");
    expect(restored?.queue.tracks[0]?.peaks).toEqual([]);
  });

  it("rejects a session that is not a queue", () => {
    expect(parsePlaybackSession("not json")).toBeNull();
    expect(parsePlaybackSession("{}")).toBeNull();
    expect(serializePlaybackSession(emptyQueue(), 0)).toBeNull();
  });
});
